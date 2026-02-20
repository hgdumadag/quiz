import React from 'react';
import { QUESTION_TYPES } from '../../../utils/constants.js';
import MultipleChoiceQuestion from './MultipleChoiceQuestion.jsx';
import TrueFalseQuestion from './TrueFalseQuestion.jsx';
import ShortAnswerQuestion from './ShortAnswerQuestion.jsx';
import LongAnswerQuestion from './LongAnswerQuestion.jsx';

/**
 * QuestionRenderer - switches on question.type and renders the appropriate component.
 *
 * Props:
 *  - question: the question object (must have .type)
 *  - currentAnswer: the student's current answer or null
 *  - locked: whether the answer is locked (exam submitted)
 *  - onAnswerChange: (questionId, answer) => void
 */
export default function QuestionRenderer({ question, currentAnswer, locked, onAnswerChange }) {
  if (!question) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No question to display.</p>
      </div>
    );
  }

  const commonProps = {
    question,
    currentAnswer,
    locked,
    onAnswerChange,
  };

  switch (question.type) {
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return <MultipleChoiceQuestion {...commonProps} />;

    case QUESTION_TYPES.TRUE_FALSE:
      return <TrueFalseQuestion {...commonProps} />;

    case QUESTION_TYPES.SHORT_ANSWER:
      return <ShortAnswerQuestion {...commonProps} />;

    case QUESTION_TYPES.LONG_ANSWER:
      return <LongAnswerQuestion {...commonProps} />;

    default:
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium mb-1">Unsupported Question Type</p>
          <p className="text-sm text-yellow-600">
            This question type ({question.type}) is not supported.
          </p>
        </div>
      );
  }
}
