import React, { useState, useEffect } from 'react';
import MathText from '../../common/MathText.jsx';

const DEFAULT_MAX_LENGTH = 200;

/**
 * ShortAnswerQuestion - textarea with character count.
 *
 * Props:
 *  - question: { id, question, points, maxLength?, ... }
 *  - currentAnswer: string or null
 *  - locked: whether the answer is locked (exam submitted)
 *  - onAnswerChange: (questionId, answer) => void
 */
export default function ShortAnswerQuestion({ question, currentAnswer, locked, onAnswerChange }) {
  const maxLength = question.maxLength || DEFAULT_MAX_LENGTH;
  const [answer, setAnswer] = useState(currentAnswer || '');

  // Sync with external state when navigating between questions
  useEffect(() => {
    setAnswer(currentAnswer || '');
  }, [currentAnswer]);

  const charCount = answer.length;
  const isOverLimit = charCount > maxLength;

  const handleChange = (e) => {
    if (locked) return;
    const newValue = e.target.value;
    setAnswer(newValue);
    onAnswerChange(question.id, newValue.trim() || null);
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

      {/* Text area */}
      <div className="mb-4">
        <textarea
          value={answer}
          onChange={handleChange}
          disabled={locked}
          maxLength={maxLength + 10} // slight buffer to show overflow visually
          rows={3}
          placeholder="Type your answer here..."
          className={`w-full px-4 py-3 rounded-lg border-2 text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
            locked
              ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed'
              : isOverLimit
                ? 'border-red-300 bg-red-50 focus:border-red-400'
                : 'border-gray-200 bg-white focus:border-blue-400'
          }`}
        />

        {/* Character counter */}
        <div className="flex justify-end mt-1">
          <span
            className={`text-xs ${
              isOverLimit
                ? 'text-red-500 font-medium'
                : charCount > maxLength * 0.9
                  ? 'text-yellow-600'
                  : 'text-gray-400'
            }`}
          >
            {charCount}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
}
