import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { VIEWS, EXAM_MODES, SESSION_STATUS } from '../../utils/constants.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export default function ExamDetail() {
  const { viewParams, navigate, storageManager, assignments } = useApp();
  const { currentUser } = useAuth();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState(null);
  const [hasInProgressSession, setHasInProgressSession] = useState(false);

  const examId = viewParams?.examId;

  // Load exam data
  useEffect(() => {
    let cancelled = false;

    async function loadExam() {
      if (!examId) {
        setLoading(false);
        return;
      }

      try {
        const examData = await storageManager.getExam(examId);
        if (!cancelled) {
          setExam(examData);
        }
      } catch (err) {
        console.error('Failed to load exam:', err);
      }

      // Check for in-progress session
      try {
        const savedState = storageManager.getSessionState();
        if (
          savedState &&
          (savedState.exam?.examMetadata?.id ?? savedState.exam?.id) === examId &&
          savedState.status === SESSION_STATUS.IN_PROGRESS
        ) {
          if (!cancelled) {
            setHasInProgressSession(true);
            setSelectedMode(savedState.mode);
          }
        }
      } catch {
        // Non-fatal
      }

      if (!cancelled) setLoading(false);
    }

    loadExam();

    return () => {
      cancelled = true;
    };
  }, [examId, storageManager]);

  // Determine allowed modes from the assignment
  const allowedModes = useMemo(() => {
    if (!currentUser || !examId) return [EXAM_MODES.PRACTICE];

    const assignment = assignments.find(
      (a) => a.userId === currentUser.id && a.examId === examId,
    );

    if (!assignment) return [EXAM_MODES.PRACTICE];

    // allowedModes may come from the exam metadata via the assignment, or default
    return assignment.allowedModes || [EXAM_MODES.PRACTICE];
  }, [assignments, currentUser, examId]);

  // Auto-select mode if only one is available
  useEffect(() => {
    if (!selectedMode && allowedModes.length === 1) {
      setSelectedMode(allowedModes[0]);
    }
  }, [allowedModes, selectedMode]);

  const handleStart = () => {
    if (!selectedMode || !examId) return;
    navigate(VIEWS.EXAM_TAKING, { examId, mode: selectedMode });
  };

  const handleResume = () => {
    if (!examId) return;
    navigate(VIEWS.EXAM_TAKING, { examId, mode: selectedMode || EXAM_MODES.PRACTICE });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" message="Loading exam details..." />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Exam Not Found</h2>
          <p className="text-gray-500 mb-6">
            The requested exam could not be loaded. It may have been removed.
          </p>
          <button
            onClick={() => navigate(VIEWS.EXAM_LIST)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Exam List
          </button>
        </div>
      </div>
    );
  }

  const metadata = exam.examMetadata || exam.metadata || {};
  const questions = exam.questions || [];
  const title = metadata.title || 'Untitled Exam';
  const subject = metadata.subject || 'General';
  const description = metadata.description || '';
  const timeLimit = metadata.timeLimit || null;
  const totalPoints = questions.reduce((sum, q) => sum + (q.points ?? 1), 0);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(VIEWS.EXAM_LIST)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm">Back to Exams</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <p className="text-blue-200 text-sm font-medium mb-1">{subject}</p>
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          {description && (
            <p className="text-blue-100 text-sm">{description}</p>
          )}
        </div>

        {/* Exam info */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Exam Details
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
              <p className="text-xs text-gray-500">Total Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {timeLimit ? `${timeLimit} min` : 'None'}
              </p>
              <p className="text-xs text-gray-500">Time Limit</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{allowedModes.length}</p>
              <p className="text-xs text-gray-500">Mode{allowedModes.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Mode selection */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Select Mode
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allowedModes.includes(EXAM_MODES.PRACTICE) && (
              <button
                onClick={() => setSelectedMode(EXAM_MODES.PRACTICE)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedMode === EXAM_MODES.PRACTICE
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedMode === EXAM_MODES.PRACTICE
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Practice Mode</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Get coaching and hints as you answer. No time pressure. Great for learning.
                </p>
              </button>
            )}

            {allowedModes.includes(EXAM_MODES.ASSESSMENT) && (
              <button
                onClick={() => setSelectedMode(EXAM_MODES.ASSESSMENT)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedMode === EXAM_MODES.ASSESSMENT
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedMode === EXAM_MODES.ASSESSMENT
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900">Assessment Mode</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Timed exam with grading. Answers are locked after submission. Results count.
                </p>
              </button>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-6 flex flex-col sm:flex-row gap-3">
          {hasInProgressSession && (
            <button
              onClick={handleResume}
              className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resume Exam
            </button>
          )}

          <button
            onClick={handleStart}
            disabled={!selectedMode}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              selectedMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {hasInProgressSession ? 'Start New Attempt' : 'Start Exam'}
          </button>
        </div>
      </div>
    </div>
  );
}
