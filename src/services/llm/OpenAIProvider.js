import LLMProvider from './LLMProvider.js';

/**
 * OpenAIProvider - OpenAI Chat Completions API integration.
 *
 * Uses the /v1/chat/completions endpoint with Bearer token authorization.
 */
export default class OpenAIProvider extends LLMProvider {
  /**
   * @param {{apiKey: string, model?: string, baseUrl?: string}} config
   */
  constructor(config = {}) {
    super();
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'gpt-4o-mini';
    this.baseUrl = (config.baseUrl || 'https://api.openai.com').replace(/\/+$/, '');
  }

  /** @override */
  async generateResponse(messages, options = {}) {
    const { maxTokens = 1024, temperature = 0.7, signal } = options;

    const body = {
      model: this.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: maxTokens,
      temperature,
    };

    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(
        `OpenAI API error ${response.status}: ${errorBody || response.statusText}`,
      );
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  /** @override */
  async validateConfig() {
    if (!this.apiKey || typeof this.apiKey !== 'string' || !this.apiKey.trim()) {
      return { valid: false, error: 'API key is required' };
    }
    return { valid: true };
  }

  /** @override */
  getProviderName() {
    return 'OpenAI';
  }
}
