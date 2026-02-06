import LLMProvider from './LLMProvider.js';

/**
 * OllamaProvider - Local Ollama server integration.
 *
 * Uses the /api/chat endpoint with stream: false for synchronous responses.
 */
export default class OllamaProvider extends LLMProvider {
  /**
   * @param {{baseUrl?: string, model?: string}} config
   */
  constructor(config = {}) {
    super();
    this.baseUrl = (config.baseUrl || 'http://localhost:11434').replace(/\/+$/, '');
    this.model = config.model || 'llama3.2';
  }

  /** @override */
  async generateResponse(messages, options = {}) {
    const { maxTokens = 1024, temperature = 0.7, signal } = options;

    const body = {
      model: this.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
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
        `Ollama error ${response.status}: ${errorBody || response.statusText}`,
      );
    }

    const data = await response.json();
    return data.message?.content ?? '';
  }

  /** @override */
  async validateConfig() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        return { valid: false, error: `Cannot connect to Ollama (HTTP ${response.status})` };
      }

      const data = await response.json();
      const models = data.models || [];
      const modelExists = models.some(
        (m) => m.name === this.model || m.name.startsWith(`${this.model}:`),
      );

      if (!modelExists && models.length > 0) {
        return {
          valid: false,
          error: `Model '${this.model}' not found. Available: ${models.map((m) => m.name).join(', ')}`,
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Cannot connect to Ollama at ${this.baseUrl}: ${error.message}`,
      };
    }
  }

  /** @override */
  getProviderName() {
    return 'Ollama';
  }
}
