import React, { useEffect } from 'react';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * MultipleChoiceQuestion - radio buttons with letter labels.
 *
 * Props:
 *  - question: { id, question, options, points, ... }
 *  - currentAnswer: the currently selected answer (option index) or null
 *  - locked: whether the answer is locked (exam submitted)
 *  - onAnswerChange: (questionId, answer) => void
 */
export default function MultipleChoiceQuestion({ question, currentAnswer, locked, onAnswerChange }) {
  const options = question.options || [];

  const handleSelect = (idx) => {
    if (locked) return;
    onAnswerChange(question.id, idx);
  };

  return (
    <div>
      {/* Question text */}
      <div className="mb-6">
        <p className="text-gray-900 text-lg leading-relaxed">{question.question || question.text}</p>
        {question.points != null && (
          <p className="text-sm text-gray-400 mt-1">
            {question.points} point{question.points !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, idx) => {
          const letter = LETTERS[idx] || String(idx + 1);
          const optionText = typeof option === 'string' ? option : (option.text ?? option.value ?? String(option));
          const isSelected = currentAnswer === idx;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={locked}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all ${
                locked
                  ? isSelected
                    ? 'border-blue-300 bg-blue-50 cursor-not-allowed opacity-80'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                  : isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              {/* Letter circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {letter}
              </div>

              {/* Option text */}
              <span className={`text-sm ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                {optionText}
              </span>

              {/* Radio indicator */}
              <div className="ml-auto flex-shrink-0">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-blue-500' : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
