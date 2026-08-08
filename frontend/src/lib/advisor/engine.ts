import faqData from '../../data/faq.json';
import websiteTypes from '../../data/website-types.json';
import recommendationData from '../../data/recommendations.json';
import portfolio from '../../data/portfolio.json';
import rules from '../../data/business-rules.json';

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  followUpQuestions: string[];
  status: string;
  /**
   * Answerable, but never offered. Unlisted entries stay searchable so a
   * direct question still gets a direct answer, and are kept out of the
   * browse list, the question count and the "related questions" chips — so
   * nobody is shown them who was not already asking.
   */
  unlisted?: boolean;
}

export const faqs = faqData as FaqItem[];
export const businessRules = rules;
export const portfolioInfo = portfolio;

/** The browsable set: everything a visitor may be offered. */
export const listedFaqs = faqs.filter((item) => !item.unlisted);

export const faqCategories = Array.from(new Set(listedFaqs.map((item) => item.category)));

export function getFaq(id: string): FaqItem | undefined {
  return faqs.find((item) => item.id === id);
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'do', 'does', 'i', 'my', 'me', 'you', 'your',
  'we', 'it', 'to', 'of', 'for', 'and', 'or', 'in', 'on', 'can', 'will', 'be',
  'what', 'how', 'why', 'when', 'need', 'have', 'has', 'with', 'this', 'that',
]);

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Scores an FAQ against a query. Keywords are weighted highest because they are
 * curated; the question text next; the answer body last, since a word appearing
 * once in a long answer says very little about relevance.
 */
function score(item: FaqItem, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const keywords = item.keywords.map((keyword) => keyword.toLowerCase());
  const question = item.question.toLowerCase();
  const answer = item.answer.toLowerCase();

  let total = 0;
  tokens.forEach((token) => {
    if (keywords.some((keyword) => keyword.includes(token))) total += 6;
    if (question.includes(token)) total += 3;
    if (answer.includes(token)) total += 1;
  });
  // Normalise so a long query cannot beat a precise match purely on volume.
  return total / Math.sqrt(tokens.length);
}

export interface FaqMatch {
  item: FaqItem;
  score: number;
}

/**
 * @param includeUnlisted search everything, not only the browsable set. Used
 *   for answering a direct question; never for building a list of
 *   suggestions.
 */
export function searchFaqs(query: string, limit = 5, includeUnlisted = false): FaqMatch[] {
  const tokens = tokenise(query);
  if (tokens.length === 0) return [];
  return (includeUnlisted ? faqs : listedFaqs)
    .map((item) => ({ item, score: score(item, tokens) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** A confident single answer, or null when the question needs the AI path. */
export function bestFaqAnswer(query: string): FaqItem | null {
  const matches = searchFaqs(query, 2, true);
  if (matches.length === 0) return null;
  const [best, runnerUp] = matches;
  if (best.score < 7) return null;

  // A high absolute score means the query hit a curated keyword, the question
  // text and the answer body — all three. A close runner-up at that level just
  // means two entries cover the same topic and both are right, so answer rather
  // than spending one of the visitor's five AI questions on something known.
  if (best.score >= 10) return best.item;

  // In the middle band a close second genuinely is ambiguous, so defer.
  if (runnerUp && best.score - runnerUp.score < 2.5) return null;
  return best.item;
}

/* ---------------- Recommendation engine ---------------- */

export interface RecommendationAnswers {
  businessType?: string;
  goal?: string;
  features: string[];
}

export interface Recommendation {
  tier: string;
  websiteTypeName: string;
  architecture: string;
  backendRequired: boolean;
  databaseRequired: boolean;
  reason: string;
  typicalPages: string[];
  typicalFeatures: string[];
  scalingPath: string;
}

interface RuleShape {
  id: string;
  when: { anyFeature?: string[]; orGoal?: string[] };
  websiteTypeId: string;
  tier: string;
  architecture: string;
  backendRequired: boolean;
  databaseRequired: boolean;
  reason: string;
  priority: number;
}

export const recommendationQuestions = recommendationData.questions;

/**
 * Deterministic, not probabilistic. Rules are sorted by priority so the
 * strongest signal wins — a login requirement outranks everything else, because
 * it is the one thing that genuinely forces a backend.
 */
export function recommend(answers: RecommendationAnswers): Recommendation {
  const ruleList = (recommendationData.rules as RuleShape[])
    .slice()
    .sort((a, b) => b.priority - a.priority);

  const matched = ruleList.find((rule) => {
    const featureHit = rule.when.anyFeature?.some((feature) => answers.features.includes(feature));
    const goalHit = rule.when.orGoal?.includes(answers.goal ?? '');
    if (!rule.when.anyFeature && !rule.when.orGoal) return true; // fallback rule
    return Boolean(featureHit || goalHit);
  }) ?? ruleList[ruleList.length - 1];

  // The business type refines which template of pages to show, but never
  // overrides an architecture decision driven by an actual feature requirement.
  const byType = (recommendationData.byBusinessType as Record<string, string>)[answers.businessType ?? ''];
  const typeId = matched.priority >= 80 ? matched.websiteTypeId : (byType ?? matched.websiteTypeId);
  const websiteType = (websiteTypes as Array<Record<string, unknown>>).find(
    (type) => type.id === typeId,
  ) ?? (websiteTypes as Array<Record<string, unknown>>)[0];

  return {
    tier: matched.tier,
    websiteTypeName: String(websiteType.name),
    architecture: matched.architecture,
    backendRequired: matched.backendRequired,
    databaseRequired: matched.databaseRequired,
    reason: matched.reason,
    typicalPages: (websiteType.typicalPages as string[]) ?? [],
    typicalFeatures: (websiteType.typicalFeatures as string[]) ?? [],
    scalingPath: String(websiteType.scalingPath ?? ''),
  };
}

/* ---------------- Understanding a typed description ---------------- */

// Lets a visitor describe their business in their own words instead of
// answering a multiple-choice quiz. Everything here is local keyword matching —
// no AI call — so describing your business costs none of the five custom
// questions and answers instantly.

const BUSINESS_HINTS: Record<string, string[]> = {
  manufacturer: ['manufactur', 'factory', 'industrial', 'production', 'exporter', 'supplier', 'fabricat', 'engineering works'],
  service: ['service', 'contractor', 'repair', 'maintenance', 'agency', 'plumb', 'electric', 'cleaning', 'transport', 'logistics'],
  consultant: ['consultant', 'consulting', 'advisor', 'coach', 'freelance', 'lawyer', 'chartered accountant', 'trainer', 'tutor'],
  retailer: ['shop', 'store', 'retail', 'showroom', 'boutique', 'dealer', 'distribut', 'wholesale'],
  restaurant: ['restaurant', 'cafe', 'café', 'food', 'bakery', 'catering', 'cloud kitchen', 'hotel'],
  construction: ['construction', 'builder', 'real estate', 'property', 'interior', 'architect', 'civil'],
  healthcare: ['clinic', 'doctor', 'dental', 'hospital', 'healthcare', 'physio', 'medical', 'ayurved', 'pharma'],
  startup: ['startup', 'start-up', 'saas', 'app idea', 'new venture'],
};

const GOAL_HINTS: Record<string, string[]> = {
  products: ['product', 'catalogue', 'catalog', 'range', 'items', 'stock', 'menu'],
  enquiries: ['enquir', 'inquir', 'lead', 'customer', 'more business', 'client'],
  content: ['blog', 'news', 'article', 'update regularly', 'publish'],
  platform: ['login', 'log in', 'account', 'sign up', 'signup', 'portal', 'dashboard', 'member'],
  present: ['profile', 'present', 'about us', 'credibility', 'trust', 'online presence'],
};

const FEATURE_HINTS: Record<string, string[]> = {
  whatsapp: ['whatsapp'],
  form: ['contact form', 'enquiry form', 'form'],
  gallery: ['gallery', 'photo', 'image', 'picture'],
  maps: ['map', 'location', 'direction', 'address'],
  blog: ['blog', 'news', 'article'],
  admin: ['admin', 'edit myself', 'update myself', 'manage content', 'cms', 'dashboard'],
  login: ['login', 'log in', 'sign in', 'account', 'register', 'member'],
  payments: ['payment', 'pay online', 'checkout', 'razorpay', 'stripe', 'ecommerce', 'e-commerce', 'sell online', 'order online'],
  multilingual: ['language', 'marathi', 'hindi', 'multilingual', 'bilingual'],
};

function firstHit(text: string, hints: Record<string, string[]>): string | undefined {
  return Object.keys(hints).find((key) => hints[key].some((hint) => text.includes(hint)));
}

export interface InferredBrief {
  answers: RecommendationAnswers;
  /** True once there is enough to give a recommendation worth reading. */
  sufficient: boolean;
  missing: 'businessType' | 'goal' | null;
}

export function inferBrief(input: string): InferredBrief {
  const text = ` ${input.toLowerCase()} `;
  const businessType = firstHit(text, BUSINESS_HINTS);
  const goal = firstHit(text, GOAL_HINTS);
  const features = Object.keys(FEATURE_HINTS).filter((key) =>
    FEATURE_HINTS[key].some((hint) => text.includes(hint)),
  );

  // A backend-forcing feature is decisive on its own — someone who says
  // "customers need to log in" has told us the architecture regardless of
  // whether they mentioned their industry.
  const decisiveFeature = features.some((feature) => ['login', 'payments', 'admin'].includes(feature));
  const sufficient = Boolean((businessType && goal) || decisiveFeature || (businessType && features.length > 0));

  return {
    answers: { businessType, goal, features },
    sufficient,
    missing: sufficient ? null : (!businessType ? 'businessType' : 'goal'),
  };
}
