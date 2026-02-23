import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../common/Toast.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import CSVExporter from '../../services/CSVExporter.js';
import { formatDate, percentage } from '../../utils/helpers.js';

export default function ResultsExporter() {
  const { exams, users, storageManager } = useApp();
  const { addToast } = useToast();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterExam, setFilterExam] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [deletingIds, setDeletingIds] = useState([]);

  const broadcastResultsUpdated = () => {
    const timestamp = String(Date.now());
    try {
      localStorage.setItem('ies_results_last_updated', timestamp);
    } catch {
      // storage unavailable
    }
    window.dispatchEvent(new CustomEvent('ies_results_updated', { detail: { timestamp } }));
  };

  useEffect(() => {
    let cancelled = false;
    async function loadResults() {
      try {
        const allResults = await storageManager.getAllResults();
        if (!cancelled) {
          setResults(allResults);
        }
      } catch (err) {
        console.error('Failed to load results:', err);
        if (!cancelled) {
          addToast('Failed to load results.', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadResults();
    return () => { cancelled = true; };
  }, [storageManager, addToast]);

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const getExamTitle = (examId) => {
    const exam = exams.find((e) => e.examMetadata?.id === examId);
    return exam?.examMetadata?.title || 'Unknown Exam';
  };

  // Unique users that appear in results
  const resultUsers = useMemo(() => {
    const userIds = [...new Set(results.map((r) => r.userId))];
    return userIds.map((id) => ({ id, name: getUserName(id) }));
  }, [results, users]);

  // Filtered results
  const filteredResults = useMemo(() => {
    let filtered = results;
    if (filterExam) {
      filtered = filtered.filter((r) => r.examId === filterExam);
    }
    if (filterUser) {
      filtered = filtered.filter((r) => r.userId === filterUser);
    }
    return filtered;
  }, [results, filterExam, filterUser]);

  const getScorePercent = (result) => {
    if (result.scorePercent != null) return result.scorePercent;
    if (result.score != null && result.totalPoints != null) {
      return percentage(result.score, result.totalPoints);
    }
    if (result.totalScore != null && result.maxScore != null) {
      return percentage(result.totalScore, result.maxScore);
    }
    return 0;
  };

  const getPassFail = (result) => {
    if (result.passed != null) return result.passed;
    const exam = exams.find((e) => e.examMetadata?.id === result.examId);
    const passingScore = exam?.examMetadata?.passingScore ?? 70;
    return getScorePercent(result) >= passingScore;
  };

  const handleExportSummary = () => {
    try {
      const csvString = CSVExporter.exportSummary(filteredResults, exams);
      const filename = `exam-results-summary-${Date.now()}.csv`;
      CSVExporter.download(csvString, filename);
      addToast(`Summary CSV exported (${filteredResults.length} results).`, 'success');
    } catch (err) {
      addToast(`Export failed: ${err.message}`, 'error');
    }
  };

  const handleExportDetailed = () => {
    try {
      const csvString = CSVExporter.exportDetailed(filteredResults, exams);
      const filename = `exam-results-detailed-${Date.now()}.csv`;
      CSVExporter.download(csvString, filename);
      addToast(`Detailed CSV exported (${filteredResults.length} results).`, 'success');
    } catch (err) {
      addToast(`Export failed: ${err.message}`, 'error');
    }
  };

  const handleDeleteResult = async (result) => {
    if (!result?.id) {
      addToast('Cannot delete this result because it has no id.', 'error');
      return;
    }

    const confirmed = window.confirm(
      `Delete this result for "${getUserName(result.userId)}" on "${getExamTitle(result.examId)}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingIds((prev) => [...prev, result.id]);
    try {
      await storageManager.deleteResult(result.id);
      setResults((prev) => prev.filter((r) => r.id !== result.id));
      broadcastResultsUpdated();
      addToast('Result deleted.', 'success');
    } catch (err) {
      addToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== result.id));
    }
  };

  const handleDeleteFiltered = async () => {
    if (filteredResults.length === 0) return;

    const deletableIds = filteredResults.map((r) => r.id).filter(Boolean);
    if (deletableIds.length === 0) {
      addToast('No deletable result ids were found for the current filter.', 'warning');
      return;
    }

    const confirmed = window.confirm(
      `Delete ${deletableIds.length} filtered result(s)? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingIds((prev) => [...prev, ...deletableIds]);
    try {
      await Promise.all(deletableIds.map((id) => storageManager.deleteResult(id)));
      setResults((prev) => prev.filter((r) => !deletableIds.includes(r.id)));
      broadcastResultsUpdated();
      addToast(`${deletableIds.length} result(s) deleted.`, 'success');
    } catch (err) {
      addToast(`Bulk delete failed: ${err.message}`, 'error');
    } finally {
      setDeletingIds((prev) => prev.filter((id) => !deletableIds.includes(id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner message="Loading results..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Results Exporter</h1>
        <p className="mt-1 text-sm text-gray-500">
          View, filter, and export exam results as CSV files.
        </p>
      </div>

      {/* Filters and Export Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Filter by Exam */}
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Exam
            </label>
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Exams</option>
              {exams.map((exam) => (
                <option key={exam.examMetadata?.id} value={exam.examMetadata?.id}>
                  {exam.examMetadata?.title || exam.examMetadata?.id}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by User */}
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by User
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Users</option>
              {resultUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleDeleteFiltered}
              disabled={filteredResults.length === 0 || deletingIds.length > 0}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Delete Filtered
            </button>
            <button
              onClick={handleExportSummary}
              disabled={filteredResults.length === 0 || deletingIds.length > 0}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Summary CSV
            </button>
            <button
              onClick={handleExportDetailed}
              disabled={filteredResults.length === 0 || deletingIds.length > 0}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Detailed CSV
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Showing {filteredResults.length} of {results.length} total results
        </p>
      </div>

      {/* Results Preview Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Results Preview
          </h2>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg
              className="mx-auto w-12 h-12 text-gray-300 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm">
              {results.length === 0
                ? 'No results available yet. Students need to complete exams first.'
                : 'No results match the current filters.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam Title
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result, idx) => {
                  const scorePercent = getScorePercent(result);
                  const passed = getPassFail(result);
                  const isDeleting = result.id ? deletingIds.includes(result.id) : false;

                  return (
                    <tr key={result.id || idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getExamTitle(result.examId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getUserName(result.userId)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                scorePercent >= 70
                                  ? 'bg-green-500'
                                  : scorePercent >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, scorePercent)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {scorePercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            passed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {passed ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {result.completedAt
                          ? formatDate(result.completedAt)
                          : result.createdAt
                          ? formatDate(result.createdAt)
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteResult(result)}
                          disabled={!result.id || isDeleting || deletingIds.length > 0}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
