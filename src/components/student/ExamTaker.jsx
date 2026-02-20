import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useExam, EXAM_ACTIONS } from '../../context/ExamContext.jsx';
import { useExamSession } from '../../hooks/useExamSession.js';
import { useTimer } from '../../hooks/useTimer.js';
import { useToast } from '../common/Toast.jsx';
import {
  VIEWS,
  EXAM_MODES,
  SESSION_STATUS,
  AUTO_SAVE_INTERVAL,
  QUESTION_TYPES,
} from '../../utils/constants.js';
import ProgressBar from '../common/ProgressBar.jsx';
import Timer from '../common/Timer.jsx';
import Modal from '../common/Modal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import TokenBudgetIndicator from '../common/TokenBudgetIndicator.jsx';
import NavigationSidebar from './NavigationSidebar.jsx';
import QuestionRenderer from './questions/QuestionRenderer.jsx';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function ExamTaker() {
  const { viewParams, navigate, storageManager } = useApp();
  const {
    exam,
    mode,
    responses,
    currentQuestionIndex,
    currentQuestion,
    currentResponse,
    flaggedQuestions,
    progress,
    status,
    gradingResults,
    timeRemaining: examTimeRemaining,
    isSubmitting,
    dispatch,
  } = useExam();

  const {
    startExam,
    setAnswer,
    navigateNext,
    navigatePrev,
    goToQuestion,
    flagQuestion,
    submitExam,
    continuePractice,
    autoSaveSession,
    isLoading,
  } = useExamSession();

  const { addToast } = useToast();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [examResult, setExamResult] = useState(null);
  const autoSaveRef = useRef(null);

  const examId = viewParams?.examId;
  const examMode = viewParams?.mode || EXAM_MODES.PRACTICE;
  const isAssessment = examMode === EXAM_MODES.ASSESSMENT;
  const isPractice = examMode === EXAM_MODES.PRACTICE;

  // -----------------------------------------------------------------------
  // Timer (only for assessment mode)
  // -----------------------------------------------------------------------
  const { timeRemaining, isWarning, isCritical } = useTimer(
    isAssessment ? examTimeRemaining : null,
    {
      enabled: isAssessment && status === SESSION_STATUS.IN_PROGRESS,
      onTenMinWarning: () => {
        addToast('10 minutes remaining!', 'warning', 6000);
      },
      onTwoMinWarning: () => {
        addToast('2 minutes remaining! Wrap up your work.', 'error', 8000);
      },
      onExpiry: () => {
        addToast('Time is up! Submitting your exam.', 'error', 5000);
        handleAutoSubmit();
      },
    },
  );

  // Sync timer ticks back into the ExamContext
  useEffect(() => {
    if (isAssessment && timeRemaining != null && status === SESSION_STATUS.IN_PROGRESS) {
      dispatch({ type: EXAM_ACTIONS.TICK_TIMER });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining]);

  // -----------------------------------------------------------------------
  // Start / Load exam on mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!examId) {
      setInitializing(false);
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        const examData = await storageManager.getExam(examId);
        if (cancelled) return;

        if (!examData) {
          addToast('Failed to load exam.', 'error');
          navigate(VIEWS.EXAM_LIST);
          return;
        }

        const success = await startExam(examData, examMode);
        if (cancelled) return;

        if (!success) {
          addToast('Failed to start exam session.', 'error');
          navigate(VIEWS.EXAM_LIST);
        }
      } catch (err) {
        console.error('ExamTaker init failed:', err);
        if (!cancelled) {
          addToast('An error occurred while starting the exam.', 'error');
          navigate(VIEWS.EXAM_LIST);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  // -----------------------------------------------------------------------
  // Auto-save (every AUTO_SAVE_INTERVAL ms)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (status !== SESSION_STATUS.IN_PROGRESS) return;

    autoSaveRef.current = setInterval(() => {
      autoSaveSession();
    }, AUTO_SAVE_INTERVAL);

    return () => {
      clearInterval(autoSaveRef.current);
    };
  }, [status, autoSaveSession]);

  // Also auto-save when navigating between questions
  useEffect(() => {
    if (status === SESSION_STATUS.IN_PROGRESS && exam) {
      autoSaveSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex]);

  // -----------------------------------------------------------------------
  // Keyboard navigation: Left/Right arrows for prev/next question
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (examResult) return; // Disable nav when showing results

    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (document.activeElement?.isContentEditable) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigatePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigatePrev, navigateNext, examResult]);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------
  const handleAnswerChange = useCallback(
    (questionId, answer) => {
      setAnswer(questionId, answer);
    },
    [setAnswer],
  );

  const handleFlagQuestion = useCallback(() => {
    if (currentQuestion) {
      flagQuestion(currentQuestion.id);
    }
  }, [currentQuestion, flagQuestion]);

  const handleSubmitExam = useCallback(async () => {
    setShowSubmitModal(false);
    const result = await submitExam();
    if (result) {
      setExamResult(result);
      addToast('Exam submitted successfully!', 'success');
    }
  }, [submitExam, addToast]);

  const handleAutoSubmit = useCallback(async () => {
    const result = await submitExam();
    if (result) {
      setExamResult(result);
      addToast('Exam auto-submitted due to time expiry.', 'warning');
    }
  }, [submitExam, addToast]);

  const handleBackToExams = () => {
    navigate(VIEWS.EXAM_LIST);
  };

  const handleContinuePractice = () => {
    // Clear the result view and unlock answers for continued practice
    setExamResult(null);
    continuePractice();
  };

  // -----------------------------------------------------------------------
  // Render: Loading states
  // -----------------------------------------------------------------------
  if (initializing || !exam) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Preparing your exam..." />
      </div>
    );
  }

  if (isSubmitting || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Grading your exam..." />
      </div>
    );
  }

  const questions = exam.questions || [];
  const totalQuestions = questions.length;
  const metadata = exam.examMetadata || exam.metadata || {};
  const examTitle = metadata.title || 'Exam';

  // -----------------------------------------------------------------------
  // Render: Results view (after submission)
  // -----------------------------------------------------------------------
  if (examResult) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Summary Header */}
        <div className={`rounded-xl p-8 mb-6 text-white ${
          examResult.passed ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'
        }`}>
          <h1 className="text-2xl font-bold mb-2">{examTitle} - Results</h1>
          <p className="text-white/80 mb-4">{isPractice ? 'Practice Mode' : 'Assessment Mode'}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-3xl font-bold">{examResult.earnedPoints}/{examResult.totalPoints}</p>
              <p className="text-sm text-white/80">Points</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-3xl font-bold">{examResult.percentage}%</p>
              <p className="text-sm text-white/80">Score</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-3xl font-bold">{examResult.passingScore}%</p>
              <p className="text-sm text-white/80">Passing Score</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-3xl font-bold">{examResult.passed ? 'PASSED' : 'FAILED'}</p>
              <p className="text-sm text-white/80">Result</p>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Question Review</h2>

          {questions.map((question, idx) => {
            const result = examResult.gradingResults[question.id];
            const userAnswer = responses[question.id]?.answer;
            const isCorrect = result?.isCorrect;
            const questionText = question.question || question.text;

            return (
              <div
                key={question.id}
                className={`bg-white rounded-xl border-2 p-6 ${
                  isCorrect ? 'border-green-200' : 'border-red-200'
                }`}
              >
                {/* Question header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {question.type.replace('-', ' ')}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {result?.score ?? 0}/{question.points ?? 1} pts
                  </div>
                </div>

                {/* Question text */}
                <p className="text-gray-900 mb-4">{questionText}</p>

                {/* Answer display based on question type */}
                {question.type === QUESTION_TYPES.MULTIPLE_CHOICE && (
                  <div className="space-y-2 mb-4">
                    {question.options.map((opt, optIdx) => {
                      const optText = typeof opt === 'string' ? opt : opt.text;
                      const isUserAnswer = userAnswer === optIdx;
                      const isCorrectAnswer = question.correctAnswer === optIdx;

                      let bgClass = 'bg-gray-50 border-gray-200';
                      // In practice mode: only highlight user's answer (red if wrong, green if correct)
                      // In assessment mode: also show correct answer
                      if (isPractice) {
                        if (isUserAnswer) {
                          bgClass = isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300';
                        }
                      } else {
                        if (isCorrectAnswer) bgClass = 'bg-green-50 border-green-300';
                        else if (isUserAnswer && !isCorrect) bgClass = 'bg-red-50 border-red-300';
                      }

                      return (
                        <div key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg border ${bgClass}`}>
                          <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                            {LETTERS[optIdx]}
                          </span>
                          <span className="flex-1">{optText}</span>
                          {isUserAnswer && (
                            <span className={`text-xs font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              Your answer {isCorrect ? '(Correct)' : '(Incorrect)'}
                            </span>
                          )}
                          {!isPractice && isCorrectAnswer && !isUserAnswer && (
                            <span className="text-xs font-medium text-green-600">Correct answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {question.type === QUESTION_TYPES.TRUE_FALSE && (
                  <div className="flex gap-4 mb-4">
                    {[true, false].map((val) => {
                      const isUserAnswer = userAnswer === val;
                      const isCorrectAnswer = question.correctAnswer === val;

                      let bgClass = 'bg-gray-50 border-gray-200';
                      if (isPractice) {
                        if (isUserAnswer) {
                          bgClass = isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300';
                        }
                      } else {
                        if (isCorrectAnswer) bgClass = 'bg-green-50 border-green-300';
                        else if (isUserAnswer && !isCorrect) bgClass = 'bg-red-50 border-red-300';
                      }

                      return (
                        <div key={String(val)} className={`flex-1 p-4 rounded-lg border text-center ${bgClass}`}>
                          <span className="font-medium">{val ? 'True' : 'False'}</span>
                          {isUserAnswer && (
                            <span className={`block text-xs mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              Your answer {isCorrect ? '(Correct)' : '(Incorrect)'}
                            </span>
                          )}
                          {!isPractice && isCorrectAnswer && !isUserAnswer && (
                            <span className="block text-xs text-green-600 mt-1">Correct answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {(question.type === QUESTION_TYPES.SHORT_ANSWER || question.type === QUESTION_TYPES.LONG_ANSWER) && (
                  <div className="mb-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                      <p className="text-xs text-gray-500 mb-1">Your answer:</p>
                      <p className="text-gray-900">{userAnswer || <em className="text-gray-400">No answer provided</em>}</p>
                    </div>
                    {isAssessment && question.expectedAnswer && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-600 mb-1">Expected answer:</p>
                        <p className="text-gray-900 text-sm">{question.expectedAnswer}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback section */}
                <div className={`rounded-lg p-4 ${isCorrect ? 'bg-green-50' : 'bg-amber-50'}`}>
                  {isCorrect ? (
                    // Correct answer feedback
                    <div>
                      <p className="font-medium text-green-800 mb-2">Correct!</p>
                      {question.explanation && (
                        <p className="text-sm text-green-700">{question.explanation}</p>
                      )}
                    </div>
                  ) : (
                    // Incorrect answer feedback
                    <div>
                      <p className="font-medium text-amber-800 mb-2">
                        {userAnswer == null ? 'No answer provided' : 'Incorrect'}
                      </p>

                      {isPractice ? (
                        // Practice mode: show hints only
                        question.hints && question.hints.length > 0 && (
                          <div>
                            <p className="text-sm text-amber-700 mb-2">Hints to help you understand:</p>
                            <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                              {question.hints.map((hint, i) => (
                                <li key={i}>{hint}</li>
                              ))}
                            </ul>
                          </div>
                        )
                      ) : (
                        // Assessment mode: show correct answer and explanation
                        <div className="space-y-2">
                          {question.explanation && (
                            <p className="text-sm text-amber-700">{question.explanation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          {isPractice ? (
            <>
              <button
                onClick={handleContinuePractice}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Continue Practice
              </button>
              <button
                onClick={handleBackToExams}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Finish
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBackToExams}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Exams
              </button>
              <button
                onClick={() => navigate(VIEWS.RESULTS_DASHBOARD)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                View All Results
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render: Exam taking view
  // -----------------------------------------------------------------------
  const isFlagged = currentQuestion ? flaggedQuestions.has(currentQuestion.id) : false;
  const unansweredCount = questions.filter((q) => responses[q.id]?.answer == null).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Exam title and mode */}
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900">{examTitle}</h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isAssessment
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isAssessment ? 'Assessment' : 'Practice'}
            </span>
          </div>

          {/* Timer (assessment only), token budget, and progress */}
          <div className="flex items-center gap-4">
            {isAssessment && examTimeRemaining != null && (
              <Timer
                timeRemaining={timeRemaining}
                isWarning={isWarning}
                isCritical={isCritical}
              />
            )}
            <TokenBudgetIndicator />
            <div className="w-32">
              <ProgressBar
                value={progress.answered}
                max={progress.total}
                label={`${progress.answered}/${progress.total}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main layout: sidebar + question area */}
      <div className="flex gap-4">
        {/* Navigation sidebar */}
        <div className="hidden md:block w-56 flex-shrink-0">
          <div className="sticky top-4">
            <NavigationSidebar onGoToQuestion={goToQuestion} />
          </div>
        </div>

        {/* Question area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Question header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                {currentQuestion?.type && (
                  <span className="text-xs text-gray-400 capitalize">
                    {currentQuestion.type.replace('-', ' ')}
                  </span>
                )}
              </div>

              {/* Flag toggle */}
              <button
                onClick={handleFlagQuestion}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isFlagged
                    ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title={isFlagged ? 'Unflag this question' : 'Flag for review'}
              >
                <svg className="w-4 h-4" fill={isFlagged ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                {isFlagged ? 'Flagged' : 'Flag'}
              </button>
            </div>

            {/* Question content */}
            <QuestionRenderer
              question={currentQuestion}
              currentAnswer={currentResponse?.answer ?? null}
              locked={currentResponse?.locked || false}
              onAnswerChange={handleAnswerChange}
            />

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={navigatePrev}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentQuestionIndex === 0
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-3">
                {/* Mobile question indicator */}
                <div className="md:hidden flex items-center gap-2">
                  <select
                    value={currentQuestionIndex}
                    onChange={(e) => goToQuestion(Number(e.target.value))}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700"
                  >
                    {questions.map((q, i) => (
                      <option key={q.id} value={i}>
                        Q{i + 1} {responses[q.id]?.answer != null ? '(done)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit exam button */}
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Submit Exam
                </button>
              </div>

              <button
                onClick={navigateNext}
                disabled={currentQuestionIndex >= totalQuestions - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentQuestionIndex >= totalQuestions - 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Exam"
        size="md"
      >
        <div>
          <p className="text-gray-700 mb-4">
            Are you sure you want to submit your exam? This action cannot be undone.
          </p>

          {unansweredCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Warning:</span> You have{' '}
                <span className="font-semibold">{unansweredCount}</span> unanswered
                question{unansweredCount !== 1 ? 's' : ''}. Unanswered questions will
                receive zero points.
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Answered:</span>{' '}
                <span className="font-medium text-gray-900">{progress.answered}/{progress.total}</span>
              </div>
              <div>
                <span className="text-gray-500">Flagged:</span>{' '}
                <span className="font-medium text-gray-900">{flaggedQuestions.size}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleSubmitExam}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
