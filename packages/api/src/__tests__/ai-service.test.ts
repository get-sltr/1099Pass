/**
 * Tests for AI Service (Bedrock client)
 * Mocks AWS Bedrock so tests run without credentials
 */

const mockSend = jest.fn();

jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({ send: mockSend })),
  InvokeModelCommand: jest.fn().mockImplementation((opts: { body: Buffer }) => opts),
}));

import { askClaude } from '../services/ai-service';

describe('ai-service', () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockSend.mockResolvedValue({
      body: new Uint8Array(
        Buffer.from(JSON.stringify({ content: [{ text: 'Mocked Claude response' }] }))
      ),
    });
  });

  describe('askClaude', () => {
    it('should return decoded assistant text', async () => {
      const result = await askClaude('Hello');

      expect(result).toBe('Mocked Claude response');
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should pass prompt in request body', async () => {
      await askClaude('Classify this income');

      const call = mockSend.mock.calls[0][0];
      const body = JSON.parse(call.body.toString());
      expect(body.messages).toEqual([{ role: 'user', content: 'Classify this income' }]);
      expect(body.max_tokens).toBe(2048);
    });

    it('should pass system prompt and maxTokens when provided', async () => {
      await askClaude('Hi', {
        systemPrompt: 'You are a coach.',
        maxTokens: 512,
      });

      const body = JSON.parse(mockSend.mock.calls[0][0].body.toString());
      expect(body.system).toBe('You are a coach.');
      expect(body.max_tokens).toBe(512);
    });
  });
});
