import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../components/common/Toast.jsx';
import ProgressBar from '../common/ProgressBar.jsx';
import { VIEWS } from '../../utils/constants.js';
import { percentage, formatDate } from '../../utils/helpers.js';
import QuestionReview from './QuestionReview.jsx';

/**
 * ResultsDashboard - Student-facing view of all exam results.
 * Supports filtering by pass/fail, expanding result cards to show
 * per-question review, and CSV export of results data.
 */
export default function ResultsDashboard() {
  const { exams, storageManager, navigate, viewParams } = useApp();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'passed' | 'failed'
  const [expandedId, setExpandedId] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest' | 'score_high' | 'score_low'

  const expandRef = useRef(null);

  // Build a map of exam id -> exam for quick lookup
  const examMap = useMemo(() => {
    return new Map(
      exams
        .map((e) => [e.examMetadata?.id ?? e.id, e])
        .filter(([examId]) => !!examId),
    );
  }, [exams]);

  const loadResults = useCallback(async (isActive = () => true) => {
    if (!currentUser?.id) {
      if (!isActive()) return;
      setLoading(false);
      setResults([]);
      return;
    }

    try {
      const userResults = await storageManager.getResultsForUser(currentUser.id);
      if (!isActive()) return;
      setResults(userResults || []);
    } catch (err) {
      console.error('Failed to load results:', err);
      if (!isActive()) return;
      addToast('Failed to load results. Please try again.', 'error');
    } finally {
      if (!isActive()) return;
      setLoading(false);
    }
  }, [currentUser?.id, storageManager, addToast]);

  // Load results on mount/current user change and keep in sync with admin updates.
  useEffect(() => {
    let cancelled = false;

    const isActive = () => !cancelled;
    const guardedLoad = async () => {
      await loadResults(isActive);
    };

    guardedLoad();

    const onResultsUpdated = () => {
      guardedLoad();
    };
    const onStorage = (event) => {
      if (event.key === 'ies_results_last_updated') {
        guardedLoad();
      }
    };
    const onFocus = () => {
      guardedLoad();
    };

    window.addEventListener('ies_results_updated', onResultsUpdated);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('ies_results_updated', onResultsUpdated);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadResults]);

  // Auto-expand result from viewParams
  useEffect(() => {
    if (viewParams?.resultId && results.length > 0) {
      setExpandedId(viewParams.resultId);
      // Scroll into view after render
      requestAnimationFrame(() => {
        expandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [viewParams?.resultId, results]);

  // Enrich results with computed fields
  const enrichedResults = useMemo(() => {
    return results.map((result) => {
      const exam = examMap.get(result.examId);
      const examTitle =
        exam?.examMetadata?.title ||
        exam?.metadata?.title ||
        exam?.title ||
        'Unknown Exam';
      const totalPoints = result.totalPoints || result.maxScore || 0;
      const earnedPoints = result.earnedPoints || result.score || 0;
      const pct = percentage(earnedPoints, totalPoints);
      const passingScore =
        exam?.examMetadata?.passingScore ??
        exam?.metadata?.passingScore ??
        exam?.passingScore ??
        70;
      const passed =
        typeof result.passed === 'boolean' ? result.passed : pct >= passingScore;
      const date = result.completedAt || result.submittedAt || result.createdAt || 0;

      return {
        ...result,
        exam,
        examTitle,
        totalPoints,
        earnedPoints,
        pct,
        passingScore,
        passed,
        date,
      };
    });
  }, [results, examMap]);

  // Apply filter
  const filteredResults = useMemo(() => {
    let filtered = enrichedResults;
    if (filter === 'passed') {
      filtered = filtered.filter((r) => r.passed);
    } else if (filter === 'failed') {
      filtered = filtered.filter((r) => !r.passed);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return (a.date || 0) - (b.date || 0);
        case 'score_high':
          return b.pct - a.pct;
        case 'score_low':
          return a.pct - b.pct;
        case 'newest':
        default:
          return (b.date || 0) - (a.date || 0);
      }
    });

    return filtered;
  }, [enrichedResults, filter, sortOrder]);

  // Summary stats
  const stats = useMemo(() => {
    const total = enrichedResults.length;
    const passed = enrichedResults.filter((r) => r.passed).length;
    const failed = total - passed;
    const avgScore = total > 0
      ? Math.round(enrichedResults.reduce((sum, r) => sum + r.pct, 0) / total)
      : 0;
    return { total, passed, failed, avgScore };
  }, [enrichedResults]);

  const toggleExpand = useCallback((resultId) => {
    setExpandedId((prev) => (prev === resultId ? null : resultId));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-500 text-sm">Loading your results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review your exam performance and detailed feedback.
          </p>
        </div>
      </div>

      {/* Stats cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Attempts" value={stats.total} color="blue" />
          <StatCard label="Passed" value={stats.passed} color="green" />
          <StatCard label="Failed" value={stats.failed} color="red" />
          <StatCard label="Avg Score" value={`${stats.avgScore}%`} color="indigo" />
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Results Yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Complete an exam to see your results here.
          </p>
          <button
            onClick={() => navigate(VIEWS.EXAM_LIST)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Browse Exams
          </button>
        </div>
      )}

      {/* Filter and sort controls */}
      {results.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', count: stats.total },
              { key: 'passed', label: 'Passed', count: stats.passed },
              { key: 'failed', label: 'Failed', count: stats.failed },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  filter === btn.key
                    ? btn.key === 'passed'
                      ? 'bg-green-600 text-white border-green-600'
                      : btn.key === 'failed'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {btn.label} ({btn.count})
              </button>
            ))}
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="score_high">Highest Score</option>
            <option value="score_low">Lowest Score</option>
          </select>
        </div>
      )}

      {/* Result cards */}
      {filteredResults.length > 0 && (
        <div className="space-y-3">
          {filteredResults.map((result) => {
            const isExpanded = expandedId === result.id;

            return (
              <div
                key={result.id}
                ref={isExpanded && viewParams?.resultId === result.id ? expandRef : null}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Card header */}
                <button
                  onClick={() => toggleExpand(result.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4"
                >
                  {/* Pass/Fail badge */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    result.passed ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {result.passed ? (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {result.examTitle}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        result.passed
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {result.passed ? 'PASS' : 'FAIL'}
                      </span>
                      {result.mode && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {result.mode}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      {result.date && (
                        <span>{formatDate(result.date)}</span>
                      )}
                      {result.attemptNumber != null && (
                        <span>Attempt #{result.attemptNumber}</span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-xl font-bold ${
                      result.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.pct}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {result.earnedPoints}/{result.totalPoints} pts
                    </div>
                  </div>

                  {/* Chevron */}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Score progress bar */}
                <div className="px-5 pb-3">
                  <ProgressBar
                    value={result.pct}
                    max={100}
                    colorClass={
                      result.passed
                        ? 'bg-green-500'
                        : result.pct >= result.passingScore * 0.7
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span className="font-medium">
                      Passing: {result.passingScore}%
                    </span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Expanded: QuestionReview */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    {result.exam ? (
                      <QuestionReview result={result} exam={result.exam} />
                    ) : (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        Exam data is not available. The exam may have been deleted.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No results match filter */}
      {results.length > 0 && filteredResults.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm">
            No results match the current filter.
          </p>
          <button
            onClick={() => setFilter('all')}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Show all results
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Stat card component for the summary section.
 */
function StatCard({ label, value, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  };

  return (
    <div className={`rounded-xl border p-4 text-center ${colorMap[color] || colorMap.blue}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  );
}
