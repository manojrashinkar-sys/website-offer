import type { Recommendation, RecommendationAnswers } from './engine';
import { recommendationQuestions } from './engine';
import { attributionSummary } from '../../utils/attribution';

export interface LeadSummary {
  businessType: string;
  goal: string;
  features: string[];
  recommendation: Recommendation;
}

function labelFor(questionId: string, value: string): string {
  const question = recommendationQuestions.find((item) => item.id === questionId);
  const option = question?.options.find((choice) => choice.value === value);
  return option?.label ?? value;
}

export function buildSummary(
  answers: RecommendationAnswers,
  recommendation: Recommendation,
): LeadSummary {
  return {
    businessType: answers.businessType ? labelFor('businessType', answers.businessType) : 'Not specified',
    goal: answers.goal ? labelFor('goal', answers.goal) : 'Not specified',
    features: answers.features
      .filter((feature) => feature !== 'none')
      .map((feature) => labelFor('features', feature)),
    recommendation,
  };
}

/**
 * The message a visitor sends after using the Advisor. It reads as something a
 * person would write, because a wall of machine-formatted fields makes the
 * sender look like a bot and gets treated like one.
 */
export function summaryMessage(summary: LeadSummary): string {
  const { recommendation } = summary;
  const lines = [
    'Hello, I used the Website Advisor and would like to discuss my project.',
    '',
    `Business type: ${summary.businessType}`,
    `Main goal: ${summary.goal}`,
    `Features: ${summary.features.length ? summary.features.join(', ') : 'To be discussed'}`,
    `Suggested website: ${recommendation.websiteTypeName}`,
    `Suggested architecture: ${recommendation.architecture}`,
    `Backend: ${recommendation.backendRequired ? 'Required' : 'Not required initially'}`,
    `Database: ${recommendation.databaseRequired ? 'Required' : 'Not required initially'}`,
    '',
    'Please help me with the next steps.',
  ];
  const utm = attributionSummary();
  if (utm) lines.push('', utm);
  return lines.join('\n');
}
