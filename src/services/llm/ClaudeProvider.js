import LLMProvider from './LLMProvider.js';

/**
 * ClaudeProvider - Anthropic Claude API integration.
 *
 * Uses the /v1/messages endpoint with the anthropic-version and x-api-key
 * headers.
 */
export default class ClaudeProvider extends LLMProvider {
  /**
   * @param {{apiKey: string, model?: string, baseUrl?: string}} config
   */
  constructor(config = {}) {
    super();
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'claude-sonnet-4-20250514';
    this.baseUrl = (config.baseUrl || 'https://api.anthropic.com').replace(/\/+$/, '');
  }

  /** @override */
  async generateResponse(messages, options = {}) {
    const { maxTokens = 1024, temperature = 0.7, signal } = options;

    // Separate system message from conversation messages if present
    let systemText;
    const conversationMessages = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemText = msg.content;
      } else {
        conversationMessages.push({ role: msg.role, content: msg.content });
      }
    }

    const body = {
      model: this.model,
      max_tokens: maxTokens,
      temperature,
      messages: conversationMessages,
    };

    if (systemText) {
      body.system = systemText;
    }

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(
        `Claude API error ${response.status}: ${errorBody || response.statusText}`,
      );
    }

    const data = await response.json();

    // The messages API returns content as an array of content blocks
    const textBlock = data.content?.find((block) => block.type === 'text');
    return textBlock ? textBlock.text : '';
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
    return 'Claude';
  }
}
