import React, { useState, useMemo } from 'react';
import { QUESTION_TYPES } from '../../utils/constants.js';

/**
 * QuestionReview - Displays per-question breakdown for a completed exam result.
 * Shows question text, user answer, correct answer, score, feedback, and misconceptions.
 * Supports filtering by correctness and collapsible question sections.
 *
 * @param {object} props
 * @param {object} props.result - The exam result object (contains gradingResults)
 * @param {object} props.exam - The exam object (contains questions array)
 */
export default function QuestionReview({ result, exam }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'incorrect'
  const [expandedIds, setExpandedIds] = useState(new Set());

  const questions = exam?.questions || [];
  const gradingResults = result?.gradingResults || result?.questionResults || {};

  // Build enriched question data
  const questionData = useMemo(() => {
    return questions.map((q) => {
      const grading = gradingResults[q.id] || {};
      const maxPoints = q.points || 1;
      const earnedScore = grading.score ?? grading.points ?? 0;
      const isCorrect = grading.isCorrect != null
        ? grading.isCorrect
        : earnedScore >= maxPoints;
      const isPartial = !isCorrect && earnedScore > 0;

      return {
        question: q,
        grading,
        maxPoints,
        earnedScore,
        isCorrect,
        isPartial,
      };
    });
  }, [questions, gradingResults]);

  // Apply filter
  const filteredData = useMemo(() => {
    if (filter === 'incorrect') {
      return questionData.filter((d) => !d.isCorrect);
    }
    return questionData;
  }, [questionData, filter]);

  // Stats
  const correctCount = questionData.filter((d) => d.isCorrect).length;
  const incorrectCount = questionData.filter((d) => !d.isCorrect && !d.isPartial).length;
  const partialCount = questionData.filter((d) => d.isPartial).length;

  const toggleExpand = (qId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredData.map((d) => d.question.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  if (!questions.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No questions found for this exam.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {correctCount} Correct
        </span>
        {partialCount > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
            </svg>
            {partialCount} Partial
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {incorrectCount} Incorrect
        </span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === 'all'
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Show All ({questionData.length})
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === 'incorrect'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Incorrect Only ({questionData.length - correctCount})
          </button>
        </div>

        <div className="flex gap-2 text-sm">
          <button
            onClick={expandAll}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Expand All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={collapseAll}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Question list */}
      {filteredData.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          {filter === 'incorrect'
            ? 'All questions were answered correctly!'
            : 'No questions to display.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredData.map((data, index) => (
            <QuestionCard
              key={data.question.id}
              data={data}
              index={questionData.indexOf(data)}
              isExpanded={expandedIds.has(data.question.id)}
              onToggle={() => toggleExpand(data.question.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Individual question card with collapsible detail section.
 */
function QuestionCard({ data, index, isExpanded, onToggle }) {
  const { question, grading, maxPoints, earnedScore, isCorrect, isPartial } = data;

  // Color scheme based on correctness
  const borderColor = isCorrect
    ? 'border-green-300'
    : isPartial
      ? 'border-yellow-300'
      : 'border-red-300';

  const bgColor = isCorrect
    ? 'bg-green-50'
    : isPartial
      ? 'bg-yellow-50'
      : 'bg-red-50';

  const iconColor = isCorrect
    ? 'text-green-600'
    : isPartial
      ? 'text-yellow-600'
      : 'text-red-600';

  const badgeClasses = isCorrect
    ? 'bg-green-100 text-green-700'
    : isPartial
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';

  const badgeLabel = isCorrect ? 'Correct' : isPartial ? 'Partial' : 'Incorrect';

  const userAnswer = formatAnswer(grading.userAnswer ?? grading.answer ?? '');
  const correctAnswer = formatAnswer(
    grading.correctAnswer ?? question.correctAnswer ?? ''
  );

  const questionTypeLabel = getQuestionTypeLabel(question.type);

  return (
    <div className={`border rounded-lg overflow-hidden ${borderColor}`}>
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-opacity-80 ${bgColor}`}
      >
        {/* Status icon */}
        <div className={`flex-shrink-0 ${iconColor}`}>
          {isCorrect ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : isPartial ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Question number and preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">
              Q{index + 1}
            </span>
            <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded">
              {questionTypeLabel}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClasses}`}>
              {badgeLabel}
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-0.5 truncate">
            {question.text || question.question || 'No question text'}
          </p>
        </div>

        {/* Score */}
        <div className="flex-shrink-0 text-right">
          <span className={`text-sm font-semibold ${iconColor}`}>
            {earnedScore}/{maxPoints}
          </span>
        </div>

        {/* Expand/collapse chevron */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded detail section */}
      {isExpanded && (
        <div className="px-4 py-4 bg-white border-t border-gray-100 space-y-4">
          {/* Question text (full) */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Question</h4>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {question.text || question.question || 'No question text'}
            </p>
            {/* Show options for multiple choice / true-false */}
            {question.options && question.options.length > 0 && (
              <div className="mt-2 space-y-1">
                {question.options.map((opt, i) => {
                  const optValue = typeof opt === 'object' ? (opt.text || opt.value || opt.label) : opt;
                  const optId = typeof opt === 'object' ? (opt.id || opt.value || String(i)) : String(opt);
                  const isUserChoice = isOptionSelected(grading.userAnswer ?? grading.answer, optId, optValue);
                  const isCorrectOpt = isOptionSelected(
                    grading.correctAnswer ?? question.correctAnswer,
                    optId,
                    optValue
                  );

                  let optClass = 'bg-gray-50 border-gray-200 text-gray-700';
                  if (isCorrectOpt && isUserChoice) {
                    optClass = 'bg-green-50 border-green-300 text-green-800';
                  } else if (isCorrectOpt) {
                    optClass = 'bg-green-50 border-green-300 text-green-700';
                  } else if (isUserChoice) {
                    optClass = 'bg-red-50 border-red-300 text-red-700';
                  }

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded border text-sm ${optClass}`}
                    >
                      <span className="font-mono text-xs w-5 text-center">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{optValue}</span>
                      {isUserChoice && (
                        <span className="text-xs font-medium">Your answer</span>
                      )}
                      {isCorrectOpt && !isUserChoice && (
                        <span className="text-xs font-medium">Correct</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* User answer (for non-MC types or when no options) */}
          {(!question.options || question.options.length === 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Your Answer</h4>
                <div className={`text-sm p-2.5 rounded border ${
                  isCorrect
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {userAnswer || <span className="italic text-gray-400">No answer provided</span>}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Correct Answer</h4>
                <div className="text-sm p-2.5 rounded border bg-green-50 border-green-200 text-green-800">
                  {correctAnswer || <span className="italic text-gray-400">N/A</span>}
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {grading.feedback && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Feedback</h4>
              <div className="text-sm text-gray-700 p-3 bg-blue-50 border border-blue-200 rounded whitespace-pre-wrap">
                {grading.feedback}
              </div>
            </div>
          )}

          {/* Misconceptions */}
          {grading.misconceptions && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Misconceptions Identified</h4>
              <div className="space-y-1.5">
                {(Array.isArray(grading.misconceptions)
                  ? grading.misconceptions
                  : [grading.misconceptions]
                ).map((m, i) => (
                  <div
                    key={i}
                    className="text-sm text-orange-800 p-2.5 bg-orange-50 border border-orange-200 rounded flex items-start gap-2"
                  >
                    <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>{typeof m === 'string' ? m : m.description || m.text || JSON.stringify(m)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Check if an option is selected in the user's or correct answer.
 */
function isOptionSelected(answer, optId, optValue) {
  if (answer == null) return false;
  if (Array.isArray(answer)) {
    return answer.some(
      (a) => String(a) === String(optId) || String(a) === String(optValue)
    );
  }
  return String(answer) === String(optId) || String(answer) === String(optValue);
}

/**
 * Format an answer value for display.
 */
function formatAnswer(answer) {
  if (answer == null || answer === '') return '';
  if (Array.isArray(answer)) return answer.join(', ');
  if (typeof answer === 'object') return JSON.stringify(answer);
  return String(answer);
}

/**
 * Get human-readable label for a question type.
 */
function getQuestionTypeLabel(type) {
  switch (type) {
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return 'Multiple Choice';
    case QUESTION_TYPES.TRUE_FALSE:
      return 'True/False';
    case QUESTION_TYPES.SHORT_ANSWER:
      return 'Short Answer';
    case QUESTION_TYPES.LONG_ANSWER:
      return 'Long Answer';
    default:
      return type || 'Unknown';
  }
}
