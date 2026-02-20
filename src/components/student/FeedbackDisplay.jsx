import React from 'react';
import { EXAM_MODES } from '../../utils/constants.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

/**
 * FeedbackDisplay - shows feedback for a question after submission.
 *
 * Props:
 *  - mode: 'practice' | 'assessment'
 *  - gradingResult: { score, isCorrect, feedback } or null
 *  - isLoading: boolean
 *  - question: the question object (for point reference)
 */
export default function FeedbackDisplay({ mode, gradingResult, isLoading, question }) {
  // Loading state
  if (isLoading) {
    return (
      <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-4">
        <LoadingSpinner
          size="sm"
          message={
            mode === EXAM_MODES.PRACTICE
              ? 'Getting coaching feedback...'
              : 'Grading your response...'
          }
        />
      </div>
    );
  }

  // No result yet
  if (!gradingResult) return null;

  const { isCorrect, feedback, score } = gradingResult;
  const maxPoints = question?.points ?? 1;

  // Practice mode: encouraging coaching style
  if (mode === EXAM_MODES.PRACTICE) {
    return (
      <div
        className={`mt-4 rounded-lg border p-4 ${
          isCorrect
            ? 'bg-green-50 border-green-200'
            : 'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {isCorrect ? (
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold mb-1 ${isCorrect ? 'text-green-800' : 'text-blue-800'}`}>
              {isCorrect ? 'Great job!' : 'Keep going!'}
            </h4>
            <p className={`text-sm whitespace-pre-wrap ${isCorrect ? 'text-green-700' : 'text-blue-700'}`}>
              {feedback}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Assessment mode: correct/incorrect with score
  return (
    <div
      className={`mt-4 rounded-lg border p-4 ${
        isCorrect
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {isCorrect ? (
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`text-sm font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </h4>
            <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {score ?? 0}/{maxPoints} pts
            </span>
          </div>
          {feedback && (
            <p className={`text-sm whitespace-pre-wrap ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              {feedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
