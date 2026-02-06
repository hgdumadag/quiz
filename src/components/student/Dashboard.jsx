import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { VIEWS, SESSION_STATUS } from '../../utils/constants.js';

export default function Dashboard() {
  const { exams, assignments, navigate, storageManager } = useApp();
  const { currentUser } = useAuth();

  // Compute stats for the current student
  const stats = useMemo(() => {
    if (!currentUser) return { assigned: 0, completed: 0, inProgress: 0 };

    const myAssignments = assignments.filter(
      (a) => a.userId === currentUser.id,
    );
    const assignedExamIds = new Set(myAssignments.map((a) => a.examId));

    let completed = 0;
    let inProgress = 0;

    myAssignments.forEach((a) => {
      if (a.status === SESSION_STATUS.COMPLETED) {
        completed++;
      } else if (a.status === SESSION_STATUS.IN_PROGRESS) {
        inProgress++;
      }
    });

    return {
      assigned: assignedExamIds.size,
      completed,
      inProgress,
    };
  }, [assignments, currentUser]);

  const firstName = currentUser?.name?.split(' ')[0] || currentUser?.username || 'Student';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {firstName}!
        </h1>
        <p className="text-blue-100 text-lg">
          Ready to continue your learning journey? Here is an overview of your progress.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.assigned}</p>
          <p className="text-sm text-gray-500 mt-1">Assigned Exams</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          <p className="text-sm text-gray-500 mt-1">Completed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
          <p className="text-sm text-gray-500 mt-1">In Progress</p>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate(VIEWS.EXAM_LIST)}
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Browse Exams</p>
              <p className="text-sm text-gray-500">View all your assigned exams</p>
            </div>
          </button>

          <button
            onClick={() => navigate(VIEWS.RESULTS_DASHBOARD)}
            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">View Results</p>
              <p className="text-sm text-gray-500">Check your scores and feedback</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
