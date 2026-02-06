import { TOKEN_BUDGET } from '../../utils/constants.js';

/**
 * TokenCounter - Tracks estimated token usage for the current session.
 *
 * Uses a simple heuristic of ~4 characters per token and accumulates
 * input + output tokens.  Provides warning and disabled thresholds.
 */
export default class TokenCounter {
  /**
   * @param {number} [maxTokens]  Maximum token budget. Defaults to TOKEN_BUDGET.MAX (500 000).
   */
  constructor(maxTokens = TOKEN_BUDGET.MAX) {
    this.maxTokens = maxTokens;
    this._inputTokens = 0;
    this._outputTokens = 0;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Rough token estimate: ~4 characters per token.
   *
   * @param {string} text
   * @returns {number}
   */
  estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  /**
   * Record token usage from an LLM call.
   *
   * @param {number} inputTokens
   * @param {number} outputTokens
   */
  addUsage(inputTokens, outputTokens) {
    this._inputTokens += inputTokens;
    this._outputTokens += outputTokens;
  }

  /**
   * Return current usage statistics.
   *
   * @returns {{
   *   used: number,
   *   max: number,
   *   percentage: number,
   *   warning: boolean,
   *   disabled: boolean
   * }}
   */
  getUsage() {
    const used = this._inputTokens + this._outputTokens;
    const percentage = this.maxTokens > 0
      ? Math.min(100, (used / this.maxTokens) * 100)
      : 100;

    return {
      used,
      max: this.maxTokens,
      percentage: Math.round(percentage * 100) / 100,
      warning: percentage >= TOKEN_BUDGET.WARNING_THRESHOLD * 100,
      disabled: percentage >= TOKEN_BUDGET.DISABLE_THRESHOLD * 100,
    };
  }

  /**
   * Reset all counters to zero.
   */
  reset() {
    this._inputTokens = 0;
    this._outputTokens = 0;
  }
}
