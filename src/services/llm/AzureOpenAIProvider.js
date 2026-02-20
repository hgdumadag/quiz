import LLMProvider from './LLMProvider.js';

/**
 * AzureOpenAIProvider - Azure OpenAI Service integration.
 *
 * Uses the Azure-specific endpoint format with api-key header authentication.
 * The model is determined by the deployment name, not a request body parameter.
 */
export default class AzureOpenAIProvider extends LLMProvider {
  /**
   * @param {{apiKey: string, baseUrl?: string, deploymentName?: string, apiVersion?: string, model?: string}} config
   */
  constructor(config = {}) {
    super();
    this.apiKey = config.apiKey || '';
    this.baseUrl = (config.baseUrl || '').replace(/\/+$/, '');
    this.deploymentName = config.deploymentName || '';
    this.apiVersion = config.apiVersion || '2024-10-21';
    // model is informational only — the deployment determines the model
    this.model = config.model || '';
  }

  /** @override */
  async generateResponse(messages, options = {}) {
    const { maxTokens = 1024, temperature = 0.7, signal } = options;

    const url =
      `${this.baseUrl}/openai/deployments/${encodeURIComponent(this.deploymentName)}` +
      `/chat/completions?api-version=${encodeURIComponent(this.apiVersion)}`;

    const body = {
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: maxTokens,
      temperature,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(
        `Azure OpenAI API error ${response.status}: ${errorBody || response.statusText}`,
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
    if (!this.baseUrl) {
      return { valid: false, error: 'Base URL (Azure resource endpoint) is required' };
    }
    if (!this.deploymentName) {
      return { valid: false, error: 'Deployment name is required' };
    }

    // Attempt a lightweight request to verify credentials and deployment
    try {
      const url =
        `${this.baseUrl}/openai/deployments/${encodeURIComponent(this.deploymentName)}` +
        `/chat/completions?api-version=${encodeURIComponent(this.apiVersion)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 1,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        return { valid: false, error: `API returned ${response.status}: ${errorBody || response.statusText}` };
      }

      return { valid: true };
    } catch (err) {
      return { valid: false, error: `Connection failed: ${err.message}` };
    }
  }

  /** @override */
  getProviderName() {
    return 'Azure OpenAI';
  }
}
