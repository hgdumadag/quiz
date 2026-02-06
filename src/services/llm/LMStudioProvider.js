import LLMProvider from './LLMProvider.js';

/**
 * LMStudioProvider - Local LM Studio server integration.
 *
 * LM Studio exposes an OpenAI-compatible API at /v1/chat/completions.
 */
export default class LMStudioProvider extends LLMProvider {
  /**
   * @param {{baseUrl?: string, model?: string}} config
   */
  constructor(config = {}) {
    super();
    this.baseUrl = (config.baseUrl || 'http://127.0.0.1:1234').replace(/\/+$/, '');
    this.model = config.model || 'default';
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
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(
        `LM Studio error ${response.status}: ${errorBody || response.statusText}`,
      );
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  /** @override */
  async validateConfig() {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`);
      if (!response.ok) {
        return { valid: false, error: `Cannot connect to LM Studio (HTTP ${response.status})` };
      }
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Cannot connect to LM Studio at ${this.baseUrl}: ${error.message}`,
      };
    }
  }

  /** @override */
  getProviderName() {
    return 'LM Studio';
  }
}
