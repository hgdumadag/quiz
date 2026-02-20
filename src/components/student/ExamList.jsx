import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { VIEWS, EXAM_MODES, SESSION_STATUS } from '../../utils/constants.js';

/**
 * Status badge component for exam assignment status.
 */
function StatusBadge({ status }) {
  const config = {
    [SESSION_STATUS.NOT_STARTED]: {
      label: 'Not Started',
      classes: 'bg-gray-100 text-gray-700',
    },
    [SESSION_STATUS.IN_PROGRESS]: {
      label: 'In Progress',
      classes: 'bg-yellow-100 text-yellow-700',
    },
    [SESSION_STATUS.COMPLETED]: {
      label: 'Completed',
      classes: 'bg-green-100 text-green-700',
    },
    [SESSION_STATUS.TIMED_OUT]: {
      label: 'Timed Out',
      classes: 'bg-red-100 text-red-700',
    },
    [SESSION_STATUS.ABANDONED]: {
      label: 'Abandoned',
      classes: 'bg-red-100 text-red-600',
    },
  };

  const { label, classes } = config[status] || config[SESSION_STATUS.NOT_STARTED];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}

/**
 * Mode badge component for allowed exam modes.
 */
function ModeBadge({ mode }) {
  const isPractice = mode === EXAM_MODES.PRACTICE;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        isPractice
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'bg-purple-50 text-purple-700 border border-purple-200'
      }`}
    >
      {isPractice ? 'Practice' : 'Assessment'}
    </span>
  );
}

export default function ExamList() {
  const { exams, assignments, navigate } = useApp();
  const { currentUser } = useAuth();

  // Build enriched list of exams assigned to this student
  const assignedExams = useMemo(() => {
    if (!currentUser) return [];

    const myAssignments = assignments.filter(
      (a) => a.userId === currentUser.id,
    );

    // Map to exam data enriched with assignment info
    return myAssignments
      .map((assignment) => {
        const exam = exams.find((e) => (e.examMetadata?.id || e.id) === assignment.examId);
        if (!exam) return null;

        const metadata = exam.examMetadata || exam.metadata || {};
        const questions = exam.questions || [];
        const allowedModes = metadata.allowedModes || [EXAM_MODES.PRACTICE];

        return {
          examId: metadata.id || exam.id,
          title: metadata.title || 'Untitled Exam',
          subject: metadata.subject || 'General',
          questionCount: questions.length,
          timeLimit: metadata.timeLimit || exam.timeLimit || null,
          allowedModes,
          status: assignment.status || SESSION_STATUS.NOT_STARTED,
          assignmentId: assignment.id,
        };
      })
      .filter(Boolean);
  }, [exams, assignments, currentUser]);

  const handleExamClick = (examId) => {
    navigate(VIEWS.EXAM_DETAIL, { examId });
  };

  if (assignedExams.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Exams</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">No Exams Assigned</h2>
          <p className="text-gray-500">
            You do not have any exams assigned yet. Check back later or contact your instructor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Exams</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignedExams.map((item) => (
          <button
            key={item.assignmentId || item.examId}
            onClick={() => handleExamClick(item.examId)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:border-blue-200 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                {item.title}
              </h3>
              <StatusBadge status={item.status} />
            </div>

            {/* Subject */}
            <p className="text-sm text-gray-500 mb-4">{item.subject}</p>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{item.questionCount} question{item.questionCount !== 1 ? 's' : ''}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{item.timeLimit ? `${item.timeLimit} min` : 'No limit'}</span>
              </div>
            </div>

            {/* Allowed modes */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 mr-1">Modes:</span>
              {item.allowedModes.map((m) => (
                <ModeBadge key={m} mode={m} />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
