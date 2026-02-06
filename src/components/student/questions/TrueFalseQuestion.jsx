import React from 'react';
import MathText from '../../common/MathText.jsx';

/**
 * TrueFalseQuestion - two large True/False buttons.
 *
 * Props:
 *  - question: { id, question, points, ... }
 *  - currentAnswer: true | false | null
 *  - locked: whether the answer is locked (exam submitted)
 *  - onAnswerChange: (questionId, answer) => void
 */
export default function TrueFalseQuestion({ question, currentAnswer, locked, onAnswerChange }) {
  const handleSelect = (value) => {
    if (locked) return;
    onAnswerChange(question.id, value);
  };

  return (
    <div>
      {/* Question text */}
      <div className="mb-6">
        <p className="text-gray-900 text-lg leading-relaxed">
          <MathText text={question.question || question.text} />
        </p>
        {question.points != null && (
          <p className="text-sm text-gray-400 mt-1">
            {question.points} point{question.points !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* True / False buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSelect(true)}
          disabled={locked}
          className={`p-6 rounded-xl border-2 font-semibold text-lg transition-all flex flex-col items-center gap-3 ${
            locked
              ? currentAnswer === true
                ? 'border-green-300 bg-green-50 cursor-not-allowed opacity-80'
                : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
              : currentAnswer === true
                ? 'border-green-500 bg-green-50 shadow-sm text-green-700'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50 text-gray-700'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              currentAnswer === true
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span>True</span>
        </button>

        <button
          onClick={() => handleSelect(false)}
          disabled={locked}
          className={`p-6 rounded-xl border-2 font-semibold text-lg transition-all flex flex-col items-center gap-3 ${
            locked
              ? currentAnswer === false
                ? 'border-red-300 bg-red-50 cursor-not-allowed opacity-80'
                : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
              : currentAnswer === false
                ? 'border-red-500 bg-red-50 shadow-sm text-red-700'
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50 text-gray-700'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              currentAnswer === false
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span>False</span>
        </button>
      </div>
    </div>
  );
}
