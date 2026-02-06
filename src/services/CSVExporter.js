import { percentage, formatDate } from '../utils/helpers.js';

/**
 * CSVExporter - Static utility class for exporting exam results to CSV format.
 * Supports summary and detailed export modes with proper CSV escaping.
 */
export default class CSVExporter {
  /**
   * Export a summary CSV of all results.
   * Columns: Exam Title, User ID, Score, Percentage, Pass/Fail, Date, Mode
   * @param {Array} results - Array of result objects
   * @param {Array} exams - Array of exam objects (used to resolve titles and passing scores)
   * @returns {string} CSV string
   */
  static exportSummary(results, exams) {
    const examMap = new Map(
      exams
        .map((e) => [e.examMetadata?.id ?? e.id, e])
        .filter(([examId]) => !!examId),
    );

    const headers = [
      'Exam Title',
      'User ID',
      'Score',
      'Percentage',
      'Pass/Fail',
      'Date',
      'Mode',
    ];

    const rows = results.map((result) => {
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
      const date = result.completedAt || result.submittedAt || result.createdAt || '';
      const mode = result.mode || exam?.examMetadata?.mode || exam?.metadata?.mode || '';

      return [
        CSVExporter._escapeCSV(examTitle),
        CSVExporter._escapeCSV(result.userId || ''),
        CSVExporter._escapeCSV(String(earnedPoints) + '/' + String(totalPoints)),
        CSVExporter._escapeCSV(pct + '%'),
        passed ? 'Pass' : 'Fail',
        CSVExporter._escapeCSV(date ? formatDate(date) : ''),
        CSVExporter._escapeCSV(mode),
      ];
    });

    return CSVExporter._buildCSV(headers, rows);
  }

  /**
   * Export a detailed per-question CSV of all results.
   * Columns: Exam Title, Question ID, Question Text, Type, User Answer, Correct Answer, Is Correct, Score, Feedback
   * @param {Array} results - Array of result objects
   * @param {Array} exams - Array of exam objects
   * @returns {string} CSV string
   */
  static exportDetailed(results, exams) {
    const examMap = new Map(
      exams
        .map((e) => [e.examMetadata?.id ?? e.id, e])
        .filter(([examId]) => !!examId),
    );

    const headers = [
      'Exam Title',
      'Question ID',
      'Question Text',
      'Type',
      'User Answer',
      'Correct Answer',
      'Is Correct',
      'Score',
      'Feedback',
    ];

    const rows = [];

    for (const result of results) {
      const exam = examMap.get(result.examId);
      const examTitle =
        exam?.examMetadata?.title ||
        exam?.metadata?.title ||
        exam?.title ||
        'Unknown Exam';
      const questions = exam?.questions || [];
      const gradingResults = result.gradingResults || result.questionResults || {};
      const storedResponses = result.responses || {};

      for (const question of questions) {
        const qId = question.id;
        const grading = gradingResults[qId] || {};
        const response = storedResponses[qId] || {};

        const userAnswer = CSVExporter._formatAnswer(
          grading.userAnswer ?? grading.answer ?? response.answer ?? '',
        );
        const correctAnswer = CSVExporter._formatAnswer(
          grading.correctAnswer ?? question.correctAnswer ?? ''
        );
        const maxPoints = question.points || 1;
        const earnedScore = grading.score ?? grading.points ?? 0;
        const isCorrect = grading.isCorrect != null
          ? grading.isCorrect
          : earnedScore >= maxPoints;

        rows.push([
          CSVExporter._escapeCSV(examTitle),
          CSVExporter._escapeCSV(qId),
          CSVExporter._escapeCSV(question.text || question.question || ''),
          CSVExporter._escapeCSV(question.type || ''),
          CSVExporter._escapeCSV(userAnswer),
          CSVExporter._escapeCSV(correctAnswer),
          isCorrect ? 'Yes' : 'No',
          CSVExporter._escapeCSV(earnedScore + '/' + maxPoints),
          CSVExporter._escapeCSV(grading.feedback || ''),
        ]);
      }
    }

    return CSVExporter._buildCSV(headers, rows);
  }

  /**
   * Download a CSV string as a file. Uses the File System Access API
   * (showSaveFilePicker) when available, otherwise falls back to
   * Blob + anchor click.
   * @param {string} csvString - The CSV content
   * @param {string} filename - Suggested filename (e.g. "results.csv")
   */
  static async download(csvString, filename = 'export.csv') {
    // Add BOM for Excel UTF-8 compatibility
    const bom = '\uFEFF';
    const content = bom + csvString;

    // Try the modern File System Access API
    if (typeof window !== 'undefined' && window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'CSV Files',
              accept: { 'text/csv': ['.csv'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        return;
      } catch (err) {
        // User cancelled or API failed — fall through to fallback
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Blob + anchor click
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Properly escape a field for CSV. Wraps in double quotes if the field
   * contains a comma, newline, or double quote. Double quotes within the
   * field are escaped by doubling them.
   * @param {*} field - The value to escape
   * @returns {string} CSV-safe string
   */
  static _escapeCSV(field) {
    if (field == null) return '';
    const str = String(field);
    // If the field contains a comma, newline, carriage return, or double quote, wrap it
    if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  /**
   * Format an answer value for display (handles arrays, objects).
   * @param {*} answer
   * @returns {string}
   */
  static _formatAnswer(answer) {
    if (answer == null) return '';
    if (Array.isArray(answer)) return answer.join('; ');
    if (typeof answer === 'object') return JSON.stringify(answer);
    return String(answer);
  }

  /**
   * Build a complete CSV string from headers and rows.
   * @param {string[]} headers
   * @param {string[][]} rows - Each row is an array of already-escaped cells
   * @returns {string}
   */
  static _buildCSV(headers, rows) {
    const headerLine = headers.map((h) => CSVExporter._escapeCSV(h)).join(',');
    const dataLines = rows.map((row) => row.join(','));
    return [headerLine, ...dataLines].join('\r\n');
  }
}
