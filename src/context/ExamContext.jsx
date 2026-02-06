import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
} from 'react';
import { SESSION_STATUS } from '../utils/constants.js';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------
export const EXAM_ACTIONS = {
  START_EXAM: 'START_EXAM',
  SET_ANSWER: 'SET_ANSWER',
  SUBMIT_ANSWER: 'SUBMIT_ANSWER',
  LOCK_ANSWER: 'LOCK_ANSWER',
  NEXT_QUESTION: 'NEXT_QUESTION',
  PREV_QUESTION: 'PREV_QUESTION',
  GOTO_QUESTION: 'GOTO_QUESTION',
  FLAG_QUESTION: 'FLAG_QUESTION',
  TICK_TIMER: 'TICK_TIMER',
  SUBMIT_EXAM: 'SUBMIT_EXAM',
  RECEIVE_GRADING: 'RECEIVE_GRADING',
  COMPLETE_EXAM: 'COMPLETE_EXAM',
  RESTORE_SESSION: 'RESTORE_SESSION',
};

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
const initialState = {
  exam: null,
  session: null,
  mode: null,
  responses: {},
  currentQuestionIndex: 0,
  flaggedQuestions: new Set(),
  timeRemaining: null,
  status: SESSION_STATUS.NOT_STARTED,
  gradingResults: {},
  isSubmitting: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function examReducer(state, action) {
  switch (action.type) {
    case EXAM_ACTIONS.START_EXAM: {
      const { exam, mode, session } = action.payload;
      // Build an initial responses map keyed by question id
      const responses = {};
      const questions = exam.questions || [];
      questions.forEach((q) => {
        responses[q.id] = {
          questionId: q.id,
          answer: null,
          submitted: false,
          locked: false,
        };
      });

      // Derive timeRemaining from exam metadata (timeLimit is in minutes)
      const timeLimitMinutes = exam.examMetadata?.timeLimit ?? exam.metadata?.timeLimit ?? null;
      const timeRemaining =
        timeLimitMinutes != null ? timeLimitMinutes * 60 : null;

      return {
        ...state,
        exam,
        mode,
        session,
        responses,
        currentQuestionIndex: 0,
        flaggedQuestions: new Set(),
        timeRemaining,
        status: SESSION_STATUS.IN_PROGRESS,
        gradingResults: {},
        isSubmitting: false,
      };
    }

    case EXAM_ACTIONS.SET_ANSWER: {
      const { questionId, answer } = action.payload;
      const existing = state.responses[questionId];
      if (!existing || existing.locked) return state;
      return {
        ...state,
        responses: {
          ...state.responses,
          [questionId]: { ...existing, answer },
        },
      };
    }

    case EXAM_ACTIONS.SUBMIT_ANSWER: {
      const { questionId } = action.payload;
      const existing = state.responses[questionId];
      if (!existing) return state;
      return {
        ...state,
        responses: {
          ...state.responses,
          [questionId]: { ...existing, submitted: true, locked: true },
        },
      };
    }

    case EXAM_ACTIONS.LOCK_ANSWER: {
      const { questionId } = action.payload;
      const existing = state.responses[questionId];
      if (!existing) return state;
      return {
        ...state,
        responses: {
          ...state.responses,
          [questionId]: { ...existing, locked: true },
        },
      };
    }

    case EXAM_ACTIONS.NEXT_QUESTION: {
      const totalQuestions = state.exam?.questions?.length ?? 0;
      const next = state.currentQuestionIndex + 1;
      if (next >= totalQuestions) return state;
      return { ...state, currentQuestionIndex: next };
    }

    case EXAM_ACTIONS.PREV_QUESTION: {
      const prev = state.currentQuestionIndex - 1;
      if (prev < 0) return state;
      return { ...state, currentQuestionIndex: prev };
    }

    case EXAM_ACTIONS.GOTO_QUESTION: {
      const { index } = action.payload;
      const total = state.exam?.questions?.length ?? 0;
      if (index < 0 || index >= total) return state;
      return { ...state, currentQuestionIndex: index };
    }

    case EXAM_ACTIONS.FLAG_QUESTION: {
      const { questionId } = action.payload;
      const newFlagged = new Set(state.flaggedQuestions);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }
      return { ...state, flaggedQuestions: newFlagged };
    }

    case EXAM_ACTIONS.TICK_TIMER: {
      if (state.timeRemaining == null) return state;
      const next = state.timeRemaining - 1;
      if (next <= 0) {
        return {
          ...state,
          timeRemaining: 0,
          status: SESSION_STATUS.TIMED_OUT,
        };
      }
      return { ...state, timeRemaining: next };
    }

    case EXAM_ACTIONS.SUBMIT_EXAM: {
      return {
        ...state,
        isSubmitting: true,
        status: SESSION_STATUS.COMPLETED,
      };
    }

    case EXAM_ACTIONS.RECEIVE_GRADING: {
      const { questionId, result } = action.payload;
      return {
        ...state,
        gradingResults: {
          ...state.gradingResults,
          [questionId]: result,
        },
      };
    }

    case EXAM_ACTIONS.COMPLETE_EXAM: {
      const { results, status } = action.payload;
      return {
        ...state,
        isSubmitting: false,
        status: status || SESSION_STATUS.COMPLETED,
        gradingResults: results ?? state.gradingResults,
      };
    }

    case EXAM_ACTIONS.RESTORE_SESSION: {
      const saved = action.payload;
      return {
        ...state,
        exam: saved.exam,
        session: saved.session,
        mode: saved.mode,
        responses: saved.responses || {},
        currentQuestionIndex: saved.currentQuestionIndex ?? 0,
        flaggedQuestions: new Set(saved.flaggedQuestions || []),
        timeRemaining: saved.timeRemaining ?? null,
        status: saved.status || SESSION_STATUS.IN_PROGRESS,
        gradingResults: saved.gradingResults || {},
        isSubmitting: false,
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const ExamContext = createContext(null);

/**
 * ExamProvider - wraps the exam session state machine and provides
 * state, dispatch, and convenience getters to children.
 */
export function ExamProvider({ children }) {
  const [state, dispatch] = useReducer(examReducer, initialState);

  // -------------------------------------------------------------------------
  // Convenience getters derived from state
  // -------------------------------------------------------------------------
  const currentQuestion = useMemo(() => {
    if (!state.exam?.questions) return null;
    return state.exam.questions[state.currentQuestionIndex] ?? null;
  }, [state.exam, state.currentQuestionIndex]);

  const currentResponse = useMemo(() => {
    if (!currentQuestion) return null;
    return state.responses[currentQuestion.id] ?? null;
  }, [currentQuestion, state.responses]);

  const progress = useMemo(() => {
    const questions = state.exam?.questions || [];
    const total = questions.length;
    if (total === 0) return { answered: 0, total: 0, percentage: 0 };
    const answered = questions.filter(
      (q) => state.responses[q.id]?.answer != null,
    ).length;
    return {
      answered,
      total,
      percentage: Math.round((answered / total) * 100),
    };
  }, [state.exam, state.responses]);

  const totalPoints = useMemo(() => {
    const questions = state.exam?.questions || [];
    return questions.reduce((sum, q) => sum + (q.points ?? 1), 0);
  }, [state.exam]);

  const earnedPoints = useMemo(() => {
    return Object.values(state.gradingResults).reduce(
      (sum, r) => sum + (r.score ?? 0),
      0,
    );
  }, [state.gradingResults]);

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------
  const value = useMemo(
    () => ({
      ...state,
      dispatch,
      currentQuestion,
      currentResponse,
      progress,
      totalPoints,
      earnedPoints,
    }),
    [state, currentQuestion, currentResponse, progress, totalPoints, earnedPoints],
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

/**
 * useExam - convenience hook for consuming ExamContext.
 */
export function useExam() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
}

export default ExamContext;
