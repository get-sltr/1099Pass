/**
 * AI Borrower Coach — In-app chat for score explanation and advice (Sonnet)
 */

import { askClaude } from './ai-service';
import type { ScoreComponent, Recommendation } from './loan-score-service';

const COACH_SYSTEM_PROMPT = `You are the 1099Pass Income Coach, an AI assistant helping gig workers
and 1099 contractors improve their Loan Readiness Score and prepare for loan applications.

You have access to the user's:
- Loan Readiness Score and component breakdown
- Income sources and trends
- Document verification status
- Score improvement recommendations

Your role:
- Explain their score in plain language (no jargon)
- Give specific, actionable advice to improve their score
- Help them understand what lenders look for in gig income
- Encourage them to connect more accounts, upload documents, diversify income
- Be supportive and empowering — many of these users have been rejected by traditional lenders

Rules:
- NEVER give specific loan advice ("you'll get approved for X")
- NEVER reference specific lenders by name
- NEVER discuss credit scores (we don't verify those)
- NEVER ask for or reference SSN, bank passwords, or sensitive credentials
- Always clarify that 1099Pass is NOT a lender
- Keep responses concise (2-3 paragraphs max)
- End with: "I'm an AI assistant, not a financial advisor."`;

export interface CoachContext {
  score: number;
  grade: string;
  components: ScoreComponent[];
  recommendations: Recommendation[];
}

/**
 * Single-turn chat with the coach. For streaming, use Lambda response streaming later.
 */
export async function chatWithCoach(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: CoachContext
): Promise<string> {
  const contextBlock = `${COACH_SYSTEM_PROMPT}

Current user context:
- Loan Readiness Score: ${context.score}/100 (${context.grade})
- Components: ${context.components.map((c) => `${c.name}: ${c.rawScore}/100`).join(', ')}
- Top recommendations: ${context.recommendations.slice(0, 3).map((r) => r.action).join('; ')}`;

  const messagesJson = JSON.stringify(
    history.concat([{ role: 'user' as const, content: message }])
  );

  return askClaude(
    `Previous conversation (if any): ${messagesJson}\n\nUser message: ${message}`,
    {
      tier: 'smart',
      systemPrompt: contextBlock,
      maxTokens: 1024,
    }
  );
}
