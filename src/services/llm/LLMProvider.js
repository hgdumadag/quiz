/**
 * LLMProvider - Abstract base class for all LLM providers.
 *
 * Subclasses must override every method; the base implementations throw
 * "not implemented" errors.
 */
export default class LLMProvider {
  /**
   * Send a conversation to the model and return the assistant's reply.
   *
   * @param {Array<{role: string, content: string}>} messages
   * @param {{maxTokens?: number, temperature?: number, signal?: AbortSignal}} [options]
   * @returns {Promise<string>}  The generated text.
   */
  async generateResponse(/* messages, options */) {
    throw new Error('generateResponse() is not implemented');
  }

  /**
   * Validate the current configuration (API key, connectivity, etc.).
   *
   * @returns {Promise<{valid: boolean, error?: string}>}
   */
  async validateConfig() {
    throw new Error('validateConfig() is not implemented');
  }

  /**
   * Return a human-readable provider name (e.g. "Claude", "OpenAI").
   *
   * @returns {string}
   */
  getProviderName() {
    throw new Error('getProviderName() is not implemented');
  }
}
