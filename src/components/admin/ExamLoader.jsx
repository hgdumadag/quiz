import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../common/Toast.jsx';
import { ExamValidator } from '../../services/ExamValidator.js';
import { safeJsonParse } from '../../utils/helpers.js';
import { QUESTION_TYPES } from '../../utils/constants.js';

const TABS = { UPLOAD: 'upload', PASTE: 'paste' };

export default function ExamLoader() {
  const { exams, loadExam } = useApp();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(TABS.UPLOAD);
  const [jsonText, setJsonText] = useState('');
  const [parsedExam, setParsedExam] = useState(null);
  const [validation, setValidation] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const isDuplicate = useCallback(
    (examJson) => {
      if (!examJson?.examMetadata?.id) return false;
      return exams.some(
        (e) => e.examMetadata?.id === examJson.examMetadata.id
      );
    },
    [exams]
  );

  const processJson = useCallback(
    (text) => {
      setJsonText(text);
      setParsedExam(null);
      setValidation(null);

      if (!text.trim()) return;

      const parsed = safeJsonParse(text);
      if (parsed === null) {
        setValidation({
          valid: false,
          errors: ['Invalid JSON: unable to parse the input.'],
          warnings: [],
        });
        return;
      }

      const result = ExamValidator.validate(parsed);
      setValidation(result);

      if (result.valid) {
        setParsedExam(parsed);
      }
    },
    []
  );

  const handleFileRead = useCallback(
    (file) => {
      if (!file) return;
      if (!file.name.endsWith('.json')) {
        setValidation({
          valid: false,
          errors: ['Only .json files are accepted.'],
          warnings: [],
        });
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        processJson(text);
      };
      reader.onerror = () => {
        setValidation({
          valid: false,
          errors: ['Failed to read the file.'],
          warnings: [],
        });
      };
      reader.readAsText(file);
    },
    [processJson]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileRead(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileRead(file);
  };

  const handleLoadExam = async () => {
    if (!parsedExam || !validation?.valid) return;

    setIsLoading(true);
    try {
      await loadExam(parsedExam);
      addToast(
        `Exam "${parsedExam.examMetadata?.title || 'Untitled'}" loaded successfully!`,
        'success'
      );
      // Reset form
      setJsonText('');
      setParsedExam(null);
      setValidation(null);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      addToast(`Failed to load exam: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeBreakdown = (questions) => {
    if (!Array.isArray(questions)) return {};
    const breakdown = {};
    for (const q of questions) {
      const type = q.type || 'unknown';
      breakdown[type] = (breakdown[type] || 0) + 1;
    }
    return breakdown;
  };

  const typeLabel = (type) => {
    const labels = {
      [QUESTION_TYPES.MULTIPLE_CHOICE]: 'Multiple Choice',
      [QUESTION_TYPES.TRUE_FALSE]: 'True/False',
      [QUESTION_TYPES.SHORT_ANSWER]: 'Short Answer',
      [QUESTION_TYPES.LONG_ANSWER]: 'Long Answer',
    };
    return labels[type] || type;
  };

  const resetState = () => {
    setJsonText('');
    setParsedExam(null);
    setValidation(null);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Load Exam</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload a JSON file or paste exam JSON to validate and load it into the system.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => { setActiveTab(TABS.UPLOAD); resetState(); }}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === TABS.UPLOAD
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => { setActiveTab(TABS.PASTE); resetState(); }}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === TABS.PASTE
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Paste JSON
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Upload Tab */}
          {activeTab === TABS.UPLOAD && (
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <svg
                  className="mx-auto w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop a JSON file here, or click to browse
                </p>
                <p className="mt-1 text-xs text-gray-400">Only .json files are accepted</p>
                {fileName && (
                  <p className="mt-2 text-sm font-medium text-blue-600">
                    Selected: {fileName}
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Paste Tab */}
          {activeTab === TABS.PASTE && (
            <div>
              <textarea
                value={jsonText}
                onChange={(e) => processJson(e.target.value)}
                placeholder="Paste your exam JSON here..."
                rows={12}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              />
            </div>
          )}
        </div>
      </div>

      {/* Validation Results */}
      {validation && (
        <div className="space-y-4">
          {/* Errors */}
          {validation.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold text-red-800">
                  Validation Errors ({validation.errors.length})
                </h3>
              </div>
              <ul className="space-y-1">
                {validation.errors.map((err, i) => (
                  <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">-</span>
                    <span>{err}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3l9.66 16.5H2.34L12 3z" />
                </svg>
                <h3 className="font-semibold text-yellow-800">
                  Warnings ({validation.warnings.length})
                </h3>
              </div>
              <ul className="space-y-1">
                {validation.warnings.map((warn, i) => (
                  <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                    <span className="mt-0.5 flex-shrink-0">-</span>
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Valid - show preview */}
          {validation.valid && parsedExam && (
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold text-green-800">Exam Valid - Preview</h3>
              </div>

              {/* Duplicate Warning */}
              {isDuplicate(parsedExam) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 font-medium">
                    Warning: An exam with ID "{parsedExam.examMetadata?.id}" already exists. Loading will overwrite the existing exam.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium text-gray-900">
                    {parsedExam.examMetadata?.title || 'Untitled'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium text-gray-900">
                    {parsedExam.examMetadata?.subject || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Questions</p>
                  <p className="font-medium text-gray-900">
                    {parsedExam.questions?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Exam ID</p>
                  <p className="font-medium text-gray-900 font-mono text-xs">
                    {parsedExam.examMetadata?.id || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Type Breakdown */}
              {parsedExam.questions?.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Question Types Breakdown</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(getTypeBreakdown(parsedExam.questions)).map(
                      ([type, count]) => (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                        >
                          <span className="font-medium">{count}</span>
                          <span>{typeLabel(type)}</span>
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Load Button */}
              <div className="pt-2">
                <button
                  onClick={handleLoadExam}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Load Exam'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
