import { useCallback, useState } from 'react';
import { useExam, EXAM_ACTIONS } from '../context/ExamContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLLM } from './useLLM.js';
import { generateId } from '../utils/helpers.js';
import {
  EXAM_MODES,
  QUESTION_TYPES,
  SESSION_STATUS,
} from '../utils/constants.js';

/**
 * useExamSession - orchestration hook for exam-taking logic.
 *
 * Combines ExamContext dispatch, AppContext storage, AuthContext user info,
 * and the useLLM hook into a single, high-level API that UI components
 * can call without knowing the underlying details.
 */
export function useExamSession() {
  const {
    dispatch,
    exam,
    session,
    mode,
    responses,
    gradingResults,
    status,
    currentQuestionIndex,
    flaggedQuestions,
    timeRemaining,
  } = useExam();
  const { storageManager } = useApp();
  const { currentUser } = useAuth();
  const { getCoaching, gradeResponse, isLoading: llmLoading } = useLLM();

  const [isLoading, setIsLoading] = useState(false);

  const normalizeLLMScore = useCallback((rawScore, maxPoints) => {
    if (typeof rawScore !== 'number' || !Number.isFinite(rawScore)) return 0;

    // Backward compatibility: older prompts used a 0-100 scale.
    const scaled = rawScore > maxPoints ? (rawScore / 100) * maxPoints : rawScore;
    const clamped = Math.max(0, Math.min(maxPoints, scaled));

    // Keep two decimals for partial credit while avoiding long floats.
    return Math.round(clamped * 100) / 100;
  }, []);

  // ---------------------------------------------------------------------------
  // startExam
  // ---------------------------------------------------------------------------
  /**
   * Start (or resume) an exam session.
   *
   * @param {object} examData  The full exam object (with questions).
   * @param {string} examMode  One of EXAM_MODES.
   * @returns {Promise<boolean>}  true if started/resumed, false on failure.
   */
  const startExam = useCallback(
    async (examData, examMode) => {
      setIsLoading(true);
      try {
        // Check for an existing in-progress session to offer resume
        const savedState = storageManager.getSessionState();
        const examId = examData.examMetadata?.id ?? examData.id;
        if (
          savedState &&
          (savedState.exam?.examMetadata?.id ?? savedState.exam?.id) === examId &&
          savedState.status === SESSION_STATUS.IN_PROGRESS
        ) {
          dispatch({ type: EXAM_ACTIONS.RESTORE_SESSION, payload: savedState });
          setIsLoading(false);
          return true;
        }

        // Create a fresh session
        const newSession = {
          id: generateId(),
          examId: examId,
          userId: currentUser?.id ?? null,
          mode: examMode,
          startedAt: new Date().toISOString(),
          status: SESSION_STATUS.IN_PROGRESS,
        };

        await storageManager.saveSession(newSession);

        dispatch({
          type: EXAM_ACTIONS.START_EXAM,
          payload: { exam: examData, mode: examMode, session: newSession },
        });

        setIsLoading(false);
        return true;
      } catch (err) {
        console.error('useExamSession.startExam failed:', err);
        setIsLoading(false);
        return false;
      }
    },
    [dispatch, storageManager, currentUser],
  );

  // ---------------------------------------------------------------------------
  // setAnswer
  // ---------------------------------------------------------------------------
  /**
   * Set an answer for a specific question (no grading yet).
   * Grading happens when the entire exam is submitted.
   *
   * @param {string} questionId
   * @param {*}      answer
   */
  const setAnswer = useCallback(
    (questionId, answer) => {
      if (!exam) return;

      dispatch({
        type: EXAM_ACTIONS.SET_ANSWER,
        payload: { questionId, answer },
      });
    },
    [exam, dispatch],
  );

  // ---------------------------------------------------------------------------
  // Navigation helpers
  // ---------------------------------------------------------------------------
  const navigateNext = useCallback(() => {
    dispatch({ type: EXAM_ACTIONS.NEXT_QUESTION });
  }, [dispatch]);

  const navigatePrev = useCallback(() => {
    dispatch({ type: EXAM_ACTIONS.PREV_QUESTION });
  }, [dispatch]);

  const goToQuestion = useCallback(
    (index) => {
      dispatch({ type: EXAM_ACTIONS.GOTO_QUESTION, payload: { index } });
    },
    [dispatch],
  );

  const flagQuestion = useCallback(
    (questionId) => {
      dispatch({ type: EXAM_ACTIONS.FLAG_QUESTION, payload: { questionId } });
    },
    [dispatch],
  );

  // ---------------------------------------------------------------------------
  // submitExam
  // ---------------------------------------------------------------------------
  /**
   * Finalize and submit the entire exam.
   * Grades all questions and persists results.
   * Returns the grading results for display.
   */
  const submitExam = useCallback(async () => {
    if (!exam || !session) return null;
    setIsLoading(true);

    try {
      dispatch({ type: EXAM_ACTIONS.SUBMIT_EXAM });

      const questions = exam.questions || [];
      const newGradingResults = {};

      // Grade each question
      for (const question of questions) {
        const resp = responses[question.id];
        const answer = resp?.answer;
        const qType = question.type;

        // Lock the answer
        dispatch({
          type: EXAM_ACTIONS.LOCK_ANSWER,
          payload: { questionId: question.id },
        });

        let result;

        if (answer == null) {
          // Unanswered
          result = {
            score: 0,
            isCorrect: false,
            feedback: 'No answer provided.',
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            hints: question.hints,
          };
        } else if (qType === QUESTION_TYPES.MULTIPLE_CHOICE) {
          const correctAnswer = question.correctAnswer;
          const isCorrect = answer === correctAnswer;
          const score = isCorrect ? (question.points ?? 1) : 0;
          const correctOptionText = question.options?.[correctAnswer] || `Option ${correctAnswer + 1}`;

          result = {
            score,
            isCorrect,
            userAnswer: answer,
            correctAnswer,
            correctOptionText: typeof correctOptionText === 'string' ? correctOptionText : correctOptionText?.text,
            userOptionText: question.options?.[answer],
            explanation: question.explanation,
            hints: question.hints,
          };
        } else if (qType === QUESTION_TYPES.TRUE_FALSE) {
          const correctAnswer = question.correctAnswer;
          const isCorrect = answer === correctAnswer;
          const score = isCorrect ? (question.points ?? 1) : 0;

          result = {
            score,
            isCorrect,
            userAnswer: answer,
            correctAnswer,
            explanation: question.explanation,
            hints: question.hints,
          };
        } else if (qType === QUESTION_TYPES.SHORT_ANSWER || qType === QUESTION_TYPES.LONG_ANSWER) {
          // For SA/LA, try LLM grading if available, otherwise use rubric-based scoring
          const llmResult = await gradeResponse(question, answer);
          if (llmResult) {
            const maxPoints = question.points ?? 1;
            const normalizedScore = normalizeLLMScore(llmResult.score, maxPoints);

            result = {
              ...llmResult,
              score: normalizedScore,
              isCorrect:
                typeof llmResult.isCorrect === 'boolean'
                  ? llmResult.isCorrect
                  : normalizedScore >= maxPoints,
              userAnswer: answer,
              expectedAnswer: question.expectedAnswer,
              explanation: question.explanation,
              hints: question.hints,
              rubric: question.rubric,
            };
          } else {
            // Fallback: can't auto-grade without LLM
            result = {
              score: 0,
              isCorrect: false,
              feedback: 'This answer requires manual review.',
              userAnswer: answer,
              expectedAnswer: question.expectedAnswer,
              explanation: question.explanation,
              hints: question.hints,
              rubric: question.rubric,
              needsManualReview: true,
            };
          }
        }

        newGradingResults[question.id] = result;

        dispatch({
          type: EXAM_ACTIONS.RECEIVE_GRADING,
          payload: { questionId: question.id, result },
        });

        // Save response to storage
        try {
          await storageManager.saveResponse({
            id: generateId(),
            sessionId: session.id,
            questionId: question.id,
            answer,
            submittedAt: new Date().toISOString(),
          });
        } catch {
          // Best effort
        }
      }

      // Calculate final score
      const totalPoints = questions.reduce(
        (sum, q) => sum + (q.points ?? 1),
        0,
      );
      const earnedPoints = Object.values(newGradingResults).reduce(
        (sum, r) => sum + (r.score ?? 0),
        0,
      );
      const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const passingScore = exam.examMetadata?.passingScore ?? 70;
      const passed = percentage >= passingScore;

      const resultRecord = {
        id: generateId(),
        sessionId: session.id,
        examId: exam.examMetadata?.id ?? exam.id,
        userId: currentUser?.id ?? null,
        mode,
        totalPoints,
        earnedPoints,
        percentage,
        passed,
        passingScore,
        completedAt: new Date().toISOString(),
        gradingResults: newGradingResults,
        responses: { ...responses },
      };

      await storageManager.saveResult(resultRecord);

      // Update session status in storage
      await storageManager.saveSession({
        ...session,
        status: SESSION_STATUS.COMPLETED,
        completedAt: resultRecord.completedAt,
      });

      // Clear saved session state
      storageManager.clearSessionState();

      dispatch({
        type: EXAM_ACTIONS.COMPLETE_EXAM,
        payload: {
          results: newGradingResults,
          status: SESSION_STATUS.COMPLETED,
        },
      });

      return resultRecord;
    } catch (err) {
      console.error('useExamSession.submitExam failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [
    exam,
    session,
    mode,
    responses,
    currentUser,
    dispatch,
    storageManager,
    gradeResponse,
    normalizeLLMScore,
  ]);

  // ---------------------------------------------------------------------------
  // autoSaveSession
  // ---------------------------------------------------------------------------
  /**
   * Persist the current exam session state to sessionStorage and IndexedDB
   * so the student can resume after an accidental page refresh.
   */
  const autoSaveSession = useCallback(async () => {
    if (!exam || !session || status !== SESSION_STATUS.IN_PROGRESS) return;

    // Snapshot the full exam state for session recovery.
    // flaggedQuestions is a Set; convert to array for JSON serialization.
    const stateSnapshot = {
      exam,
      session,
      mode,
      responses,
      currentQuestionIndex,
      flaggedQuestions: Array.from(flaggedQuestions),
      timeRemaining,
      status,
      gradingResults,
    };

    // Save to sessionStorage (synchronous, fast)
    storageManager.setSessionState(stateSnapshot);

    // Also persist the session to IndexedDB
    try {
      await storageManager.saveSession({
        ...session,
        status: SESSION_STATUS.IN_PROGRESS,
        lastSavedAt: new Date().toISOString(),
      });
    } catch {
      // Best effort
    }
  }, [
    exam,
    session,
    mode,
    responses,
    currentQuestionIndex,
    flaggedQuestions,
    timeRemaining,
    status,
    gradingResults,
    storageManager,
  ]);

  return {
    startExam,
    setAnswer,
    navigateNext,
    navigatePrev,
    goToQuestion,
    flagQuestion,
    submitExam,
    autoSaveSession,
    isLoading: isLoading || llmLoading,
  };
}

export default useExamSession;
