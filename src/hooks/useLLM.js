import { useState, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';

/**
 * useLLM - custom hook for LLM interactions (coaching and grading).
 *
 * Reads llmService and tokenCounter from AppContext.  Wraps async calls
 * with loading / error state and token-budget enforcement.
 *
 * @returns {{
 *   getCoaching: function,
 *   gradeResponse: function,
 *   isLoading: boolean,
 *   error: string|null,
 *   tokenUsage: object|null,
 * }}
 */
export function useLLM() {
  const { llmService, tokenCounter } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenUsage, setTokenUsage] = useState(() =>
    tokenCounter ? tokenCounter.getUsage() : null,
  );

  // Guard against concurrent calls clobbering state
  const activeCall = useRef(0);

  /**
   * Refresh local tokenUsage snapshot from the counter.
   */
  const refreshTokenUsage = useCallback(() => {
    if (tokenCounter) {
      setTokenUsage(tokenCounter.getUsage());
    }
  }, [tokenCounter]);

  /**
   * Get coaching feedback for a student's answer.
   *
   * @param {object} question
   * @param {*}      userAnswer
   * @param {number} attemptNumber
   * @param {Array}  hints
   * @returns {Promise<string|null>} coaching text, or null on failure
   */
  const getCoaching = useCallback(
    async (question, userAnswer, attemptNumber, hints) => {
      // Token budget guard
      if (tokenCounter) {
        const usage = tokenCounter.getUsage();
        if (usage.disabled) {
          const msg = 'Token budget exhausted. LLM features are disabled.';
          setError(msg);
          return null;
        }
      }

      if (!llmService) {
        setError('LLM service is not configured.');
        return null;
      }

      const callId = ++activeCall.current;
      setIsLoading(true);
      setError(null);

      try {
        const result = await llmService.getCoaching(
          question,
          userAnswer,
          attemptNumber,
          hints,
        );

        // Only update state if this is still the latest call
        if (callId === activeCall.current) {
          refreshTokenUsage();
          setIsLoading(false);
        }
        return result;
      } catch (err) {
        if (callId === activeCall.current) {
          setError(err.message || 'Failed to get coaching from LLM.');
          setIsLoading(false);
        }
        return null;
      }
    },
    [llmService, tokenCounter, refreshTokenUsage],
  );

  /**
   * Grade a student's response via the LLM.
   *
   * @param {object} question
   * @param {*}      userAnswer
   * @returns {Promise<{score: number, feedback: string, isCorrect: boolean}|null>}
   */
  const gradeResponse = useCallback(
    async (question, userAnswer) => {
      // Token budget guard
      if (tokenCounter) {
        const usage = tokenCounter.getUsage();
        if (usage.disabled) {
          const msg = 'Token budget exhausted. LLM features are disabled.';
          setError(msg);
          return null;
        }
      }

      if (!llmService) {
        setError('LLM service is not configured.');
        return null;
      }

      const callId = ++activeCall.current;
      setIsLoading(true);
      setError(null);

      try {
        const result = await llmService.gradeResponse(question, userAnswer);

        if (callId === activeCall.current) {
          refreshTokenUsage();
          setIsLoading(false);
        }
        return result;
      } catch (err) {
        if (callId === activeCall.current) {
          setError(err.message || 'Failed to grade response via LLM.');
          setIsLoading(false);
        }
        return null;
      }
    },
    [llmService, tokenCounter, refreshTokenUsage],
  );

  return { getCoaching, gradeResponse, isLoading, error, tokenUsage };
}

export default useLLM;
