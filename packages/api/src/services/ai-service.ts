/**
 * AI Service — AWS Bedrock + Claude
 * Single client for all AI features. No financial data leaves AWS.
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export type ModelTier = 'fast' | 'smart';

const MODELS: Record<ModelTier, string> = {
  fast: 'anthropic.claude-haiku-4-5-20251001-v1:0',
  smart: 'anthropic.claude-sonnet-4-6-20250514-v1:0',
};

export interface AskClaudeOptions {
  tier?: ModelTier;
  systemPrompt?: string;
  maxTokens?: number;
}

/**
 * Invoke Claude via Bedrock. Returns the assistant text.
 */
export async function askClaude(
  prompt: string,
  options: AskClaudeOptions = {}
): Promise<string> {
  const { tier = 'fast', systemPrompt, maxTokens = 2048 } = options;
  const command = new InvokeModelCommand({
    modelId: MODELS[tier],
    contentType: 'application/json',
    accept: 'application/json',
    body: Buffer.from(
      JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: maxTokens,
        ...(systemPrompt && { system: systemPrompt }),
        messages: [{ role: 'user' as const, content: prompt }],
      })
    ),
  });
  const response = await bedrock.send(command);
  const parsed = JSON.parse(new TextDecoder().decode(response.body));
  return parsed.content[0].text;
}
