import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { VIEWS, ROLES } from '../../utils/constants.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export default function Dashboard() {
  const { users, exams, assignments, storageManager, navigate } = useApp();
  const { currentUser } = useAuth();
  const [resultsCount, setResultsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadResults() {
      try {
        const results = await storageManager.getAllResults();
        if (!cancelled) {
          setResultsCount(results.length);
        }
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadResults();
    return () => { cancelled = true; };
  }, [storageManager]);

  const studentCount = users.filter((u) => u.role === ROLES.STUDENT).length;

  const statsCards = [
    {
      label: 'Total Exams',
      value: exams.length,
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-blue-500',
    },
    {
      label: 'Total Students',
      value: studentCount,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      color: 'bg-green-500',
    },
    {
      label: 'Assignments',
      value: assignments.length,
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'bg-yellow-500',
    },
    {
      label: 'Completed Results',
      value: loading ? '...' : resultsCount,
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: 'bg-purple-500',
    },
  ];

  const quickLinks = [
    {
      title: 'Manage Exams',
      description: 'Upload and manage exam JSON files',
      view: VIEWS.ADMIN_EXAMS,
      icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
      color: 'border-blue-400 hover:bg-blue-50',
    },
    {
      title: 'Manage Users',
      description: 'Add, view, and remove users',
      view: VIEWS.ADMIN_USERS,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      color: 'border-green-400 hover:bg-green-50',
    },
    {
      title: 'Assign Exams',
      description: 'Assign exams to students',
      view: VIEWS.ADMIN_ASSIGNMENTS,
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
      color: 'border-yellow-400 hover:bg-yellow-50',
    },
    {
      title: 'LLM Configuration',
      description: 'Configure AI provider settings',
      view: VIEWS.ADMIN_LLM_CONFIG,
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      color: 'border-indigo-400 hover:bg-indigo-50',
    },
    {
      title: 'Export Results',
      description: 'View and export exam results as CSV',
      view: VIEWS.ADMIN_RESULTS,
      icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'border-purple-400 hover:bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back{currentUser ? `, ${currentUser.name}` : ''}. Here is an overview of your exam system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg shadow p-5 flex items-center gap-4"
          >
            <div className={`${card.color} p-3 rounded-lg`}>
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={card.icon}
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <button
              key={link.view}
              onClick={() => navigate(link.view)}
              className={`bg-white rounded-lg shadow border-l-4 p-5 text-left transition-colors ${link.color}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={link.icon}
                  />
                </svg>
                <h3 className="font-semibold text-gray-900">{link.title}</h3>
              </div>
              <p className="text-sm text-gray-500">{link.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
