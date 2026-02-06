import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../common/Toast.jsx';
import { ROLES } from '../../utils/constants.js';
import { formatDate } from '../../utils/helpers.js';

export default function ExamAssignment() {
  const { users, exams, assignments, saveAssignments } = useApp();
  const { addToast } = useToast();

  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [selectedExams, setSelectedExams] = useState(new Set());

  const students = useMemo(
    () => users.filter((u) => u.role === ROLES.STUDENT),
    [users]
  );

  const toggleUser = (userId) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleExam = (examId) => {
    setSelectedExams((prev) => {
      const next = new Set(prev);
      if (next.has(examId)) {
        next.delete(examId);
      } else {
        next.add(examId);
      }
      return next;
    });
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === students.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(students.map((s) => s.id)));
    }
  };

  const toggleAllExams = () => {
    if (selectedExams.size === exams.length) {
      setSelectedExams(new Set());
    } else {
      setSelectedExams(new Set(exams.map((e) => e.examMetadata?.id)));
    }
  };

  const handleCreateAssignments = () => {
    if (selectedUsers.size === 0) {
      addToast('Please select at least one student.', 'warning');
      return;
    }
    if (selectedExams.size === 0) {
      addToast('Please select at least one exam.', 'warning');
      return;
    }

    const existingSet = new Set(
      assignments.map((a) => `${a.userId}::${a.examId}`)
    );

    let added = 0;
    const newAssignments = [...assignments];

    for (const userId of selectedUsers) {
      for (const examId of selectedExams) {
        const key = `${userId}::${examId}`;
        if (!existingSet.has(key)) {
          newAssignments.push({
            userId,
            examId,
            assignedAt: Date.now(),
          });
          existingSet.add(key);
          added++;
        }
      }
    }

    if (added === 0) {
      addToast('All selected combinations are already assigned.', 'info');
      return;
    }

    saveAssignments(newAssignments);
    addToast(`Created ${added} new assignment${added > 1 ? 's' : ''}.`, 'success');
    setSelectedUsers(new Set());
    setSelectedExams(new Set());
  };

  const handleRemoveAssignment = (userId, examId) => {
    const updated = assignments.filter(
      (a) => !(a.userId === userId && a.examId === examId)
    );
    saveAssignments(updated);
    addToast('Assignment removed.', 'success');
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const getExamTitle = (examId) => {
    const exam = exams.find((e) => e.examMetadata?.id === examId);
    return exam?.examMetadata?.title || 'Unknown Exam';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exam Assignments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Assign exams to students and manage existing assignments.
        </p>
      </div>

      {/* Selection Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students Panel */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">
              Students ({students.length})
            </h2>
            {students.length > 0 && (
              <button
                onClick={toggleAllUsers}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedUsers.size === students.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {students.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">
                No students found. Add students in User Management first.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {students.map((student) => (
                  <li key={student.id}>
                    <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(student.id)}
                        onChange={() => toggleUser(student.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                          {student.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm text-gray-900">{student.name}</span>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Exams Panel */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">
              Exams ({exams.length})
            </h2>
            {exams.length > 0 && (
              <button
                onClick={toggleAllExams}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedExams.size === exams.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {exams.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">
                No exams loaded. Load exams in the Exam Loader first.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {exams.map((exam) => {
                  const examId = exam.examMetadata?.id;
                  return (
                    <li key={examId}>
                      <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedExams.has(examId)}
                          onChange={() => toggleExam(examId)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm text-gray-900 block">
                            {exam.examMetadata?.title || 'Untitled'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {exam.examMetadata?.subject || 'No subject'} -- {exam.questions?.length || 0} questions
                          </span>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Create Assignments Button */}
      <div className="flex justify-center">
        <button
          onClick={handleCreateAssignments}
          disabled={selectedUsers.size === 0 || selectedExams.size === 0}
          className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Create Assignments
          {selectedUsers.size > 0 && selectedExams.size > 0 && (
            <span className="ml-2 text-blue-200">
              ({selectedUsers.size} x {selectedExams.size} = {selectedUsers.size * selectedExams.size})
            </span>
          )}
        </button>
      </div>

      {/* Current Assignments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Current Assignments ({assignments.length})
          </h2>
        </div>

        {assignments.length === 0 ? (
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
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <p className="text-sm">No assignments yet. Select students and exams above to create assignments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exam Title
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Date
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignments.map((assignment, idx) => (
                  <tr key={`${assignment.userId}-${assignment.examId}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getUserName(assignment.userId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getExamTitle(assignment.examId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {assignment.assignedAt
                        ? formatDate(assignment.assignedAt)
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          handleRemoveAssignment(
                            assignment.userId,
                            assignment.examId
                          )
                        }
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
