import { LLM_PROVIDERS } from '../../utils/constants.js';
import ClaudeProvider from './ClaudeProvider.js';
import OpenAIProvider from './OpenAIProvider.js';
import OllamaProvider from './OllamaProvider.js';
import LMStudioProvider from './LMStudioProvider.js';

/**
 * LLMProviderFactory - Creates the appropriate LLMProvider instance based on
 * a provider type string.
 */
export default class LLMProviderFactory {
  /**
   * Create an LLM provider instance.
   *
   * @param {string} providerType  One of LLM_PROVIDERS values: 'claude', 'openai', 'ollama', 'lmstudio'.
   * @param {object} config        Provider-specific configuration.
   * @returns {import('./LLMProvider.js').default}
   */
  static create(providerType, config = {}) {
    switch (providerType) {
      case LLM_PROVIDERS.CLAUDE:
        return new ClaudeProvider(config);

      case LLM_PROVIDERS.OPENAI:
        return new OpenAIProvider(config);

      case LLM_PROVIDERS.OLLAMA:
        return new OllamaProvider(config);

      case LLM_PROVIDERS.LMSTUDIO:
        return new LMStudioProvider(config);

      default:
        throw new Error(`Unknown LLM provider: "${providerType}"`);
    }
  }
}
