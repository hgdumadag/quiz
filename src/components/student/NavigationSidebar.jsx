import React from 'react';
import { useExam } from '../../context/ExamContext.jsx';

/**
 * NavigationSidebar - vertical list of questions with status icons.
 *
 * Status colors:
 *  - Blue border/bg    = current
 *  - Green check       = answered
 *  - Orange flag       = flagged
 *  - Gray              = unanswered
 *  - Lock icon         = locked (submitted in assessment)
 */
export default function NavigationSidebar({ onGoToQuestion }) {
  const {
    exam,
    responses,
    currentQuestionIndex,
    flaggedQuestions,
    progress,
  } = useExam();

  const questions = exam?.questions || [];

  const getQuestionStatus = (question, index) => {
    const response = responses[question.id];
    const isCurrent = index === currentQuestionIndex;
    const isFlagged = flaggedQuestions.has(question.id);
    const isAnswered = response?.answer != null;
    const isLocked = response?.locked === true;

    return { isCurrent, isFlagged, isAnswered, isLocked };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Questions
      </h3>

      {/* Question list */}
      <div className="flex-1 overflow-y-auto space-y-1 mb-4">
        {questions.map((question, index) => {
          const { isCurrent, isFlagged, isAnswered, isLocked } = getQuestionStatus(question, index);

          let bgClass = 'bg-white hover:bg-gray-50';
          let borderClass = 'border-transparent';
          let textClass = 'text-gray-600';

          if (isCurrent) {
            bgClass = 'bg-blue-50';
            borderClass = 'border-blue-500';
            textClass = 'text-blue-700 font-semibold';
          } else if (isAnswered) {
            textClass = 'text-gray-900';
          }

          return (
            <button
              key={question.id}
              onClick={() => onGoToQuestion(index)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border-l-4 text-sm transition-all ${bgClass} ${borderClass}`}
            >
              {/* Status icon */}
              <div className="flex-shrink-0">
                {isLocked ? (
                  // Lock icon
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                ) : isFlagged ? (
                  // Flag icon (orange)
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                  </div>
                ) : isAnswered ? (
                  // Green check
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isCurrent ? (
                  // Blue current indicator
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{index + 1}</span>
                  </div>
                ) : (
                  // Gray unanswered
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-400 font-medium">{index + 1}</span>
                  </div>
                )}
              </div>

              {/* Question label */}
              <span className={`truncate ${textClass}`}>
                Q{index + 1}
              </span>

              {/* Flag indicator (secondary, shown even when not the primary icon) */}
              {isFlagged && !isLocked && isAnswered && (
                <svg className="w-3.5 h-3.5 text-orange-400 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress summary */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Progress</span>
          <span className="text-gray-700 font-medium">
            {progress.answered}/{progress.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          {progress.percentage}% complete
        </p>
      </div>
    </div>
  );
}
