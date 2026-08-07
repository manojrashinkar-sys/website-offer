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
}

export const faqs = faqData as FaqItem[];
export const businessRules = rules;
export const portfolioInfo = portfolio;

export const faqCategories = Array.from(new Set(faqs.map((item) => item.category)));

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

export function searchFaqs(query: string, limit = 5): FaqMatch[] {
  const tokens = tokenise(query);
  if (tokens.length === 0) return [];
  return faqs
    .map((item) => ({ item, score: score(item, tokens) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** A confident single answer, or null when the question needs the AI path. */
export function bestFaqAnswer(query: string): FaqItem | null {
  const matches = searchFaqs(query, 2);
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
