import { LLM_DEFAULTS } from '../../utils/constants.js';
import { sleep } from '../../utils/helpers.js';
import { buildCoachingPrompt, buildGradingPrompt } from './PromptTemplates.js';

/**
 * LLMService - Main service class consumed by the application.
 *
 * Wraps an LLMProvider with retry logic, timeouts, and domain-specific
 * convenience methods (coaching, grading).
 */
export default class LLMService {
  /**
   * @param {import('./LLMProvider.js').default} provider
   */
  constructor(provider) {
    this._provider = provider;
  }

  // ---------------------------------------------------------------------------
  // Core
  // ---------------------------------------------------------------------------

  /**
   * Send messages to the underlying provider with retry + timeout.
   *
   * - Up to MAX_RETRIES attempts (default 3).
   * - Exponential backoff: BACKOFF_BASE * 2^(attempt-1)  (1 s, 2 s, 4 s).
   * - Each attempt has a TIMEOUT (default 30 s) via AbortController.
   *
   * @param {Array<{role: string, content: string}>} messages
   * @param {{maxTokens?: number, temperature?: number}} [options]
   * @returns {Promise<string>}
   */
  async generateResponse(messages, options = {}) {
    const maxRetries = LLM_DEFAULTS.MAX_RETRIES;
    const backoffBase = LLM_DEFAULTS.BACKOFF_BASE;
    const timeout = LLM_DEFAULTS.TIMEOUT;

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      try {
        const result = await this._provider.generateResponse(messages, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timer);
        return result;
      } catch (error) {
        clearTimeout(timer);
        lastError = error;

        console.warn(
          `[LLMService] Attempt ${attempt}/${maxRetries} failed: ${error.message}`,
        );

        // Wait before retrying (skip wait after last attempt)
        if (attempt < maxRetries) {
          const delay = backoffBase * Math.pow(2, attempt - 1);
          await sleep(delay);
        }
      }
    }

    throw new Error(
      `LLM service unavailable after ${maxRetries} attempts: ${lastError?.message ?? 'unknown error'}`,
    );
  }

  // ---------------------------------------------------------------------------
  // Domain methods
  // ---------------------------------------------------------------------------

  /**
   * Get coaching feedback for a student in practice mode.
   *
   * @param {object} question       The question object.
   * @param {string} userAnswer     The student's answer.
   * @param {number} attemptNumber  1-based attempt count.
   * @param {string[]} hints        Previously shown hints.
   * @returns {Promise<string>}     Coaching text.
   */
  async getCoaching(question, userAnswer, attemptNumber, hints = []) {
    const messages = buildCoachingPrompt(question, userAnswer, attemptNumber, hints);
    return this.generateResponse(messages, {
      maxTokens: 256,
      temperature: 0.7,
    });
  }

  /**
   * Grade a student's response using the LLM.
   *
   * @param {object} question   The question object.
   * @param {string} userAnswer The student's answer.
   * @returns {Promise<{score: number, feedback: string, isCorrect: boolean, misconceptions?: string[]}>}
   */
  async gradeResponse(question, userAnswer) {
    const messages = buildGradingPrompt(question, userAnswer);
    const raw = await this.generateResponse(messages, {
      maxTokens: 512,
      temperature: 0.3,
    });

    // Try to parse JSON from the response
    try {
      const parsed = JSON.parse(raw);
      return {
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        feedback: parsed.feedback || '',
        isCorrect: !!parsed.isCorrect,
        misconceptions: Array.isArray(parsed.misconceptions) ? parsed.misconceptions : [],
      };
    } catch {
      // Fallback: attempt to extract JSON from markdown fences or surrounding text
      return this._fallbackParseGrading(raw);
    }
  }

  // ---------------------------------------------------------------------------
  // Provider management
  // ---------------------------------------------------------------------------

  /**
   * Swap the underlying provider at runtime.
   *
   * @param {import('./LLMProvider.js').default} provider
   */
  setProvider(provider) {
    this._provider = provider;
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Best-effort extraction of grading JSON from a messy LLM response.
   * @param {string} raw
   * @returns {{score: number, feedback: string, isCorrect: boolean, misconceptions: string[]}}
   */
  _fallbackParseGrading(raw) {
    // Try to find JSON inside markdown code fences
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try {
        const parsed = JSON.parse(fenceMatch[1].trim());
        return {
          score: typeof parsed.score === 'number' ? parsed.score : 0,
          feedback: parsed.feedback || '',
          isCorrect: !!parsed.isCorrect,
          misconceptions: Array.isArray(parsed.misconceptions) ? parsed.misconceptions : [],
        };
      } catch {
        // continue to next strategy
      }
    }

    // Try to find a JSON object anywhere in the text
    const jsonMatch = raw.match(/\{[\s\S]*"score"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: typeof parsed.score === 'number' ? parsed.score : 0,
          feedback: parsed.feedback || '',
          isCorrect: !!parsed.isCorrect,
          misconceptions: Array.isArray(parsed.misconceptions) ? parsed.misconceptions : [],
        };
      } catch {
        // fall through
      }
    }

    // Ultimate fallback: return a zero-score result with the raw text as feedback
    return {
      score: 0,
      feedback: raw || 'Unable to parse grading response from LLM.',
      isCorrect: false,
      misconceptions: [],
    };
  }
}
