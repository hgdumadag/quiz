import { QUESTION_TYPES } from '../../utils/constants.js';

/**
 * PromptTemplates - Functions that return message arrays suitable for any
 * LLM provider's generateResponse(messages) method.
 */

/**
 * Build a coaching prompt for practice mode.
 *
 * The system message instructs the LLM to act as a supportive tutor that
 * guides without revealing the answer.  Information about the question,
 * the student's answer, and attempt history is supplied in the user message.
 *
 * @param {object} question       The full question object.
 * @param {string} userAnswer     The student's most recent answer.
 * @param {number} attemptNumber  Which attempt this is (1-based).
 * @param {string[]} previousHints  Any hints already shown to the student.
 * @returns {Array<{role: string, content: string}>}
 */
export function buildCoachingPrompt(question, userAnswer, attemptNumber, previousHints = []) {
  const systemMessage = [
    'You are a supportive tutor. Guide the student without revealing the answer.',
    'STRICT RULES:',
    '1. NEVER reveal the correct answer directly.',
    '2. Guide the student toward discovering it themselves.',
    '3. Be encouraging, warm, and supportive.',
    '4. Focus on the learning process, not just the outcome.',
    '',
    'COACHING STRATEGY BY ATTEMPT:',
    '- Attempt 1: Gentle conceptual nudge - ask a clarifying question or point to the relevant concept.',
    '- Attempt 2: More specific guidance - identify the likely error type and redirect thinking.',
    '- Attempt 3+: Very specific hints that narrow the field considerably, but still do not state the answer.',
    '',
    'Keep your response to 2-4 sentences. Be concise and actionable.',
  ].join('\n');

  // Build user message with question details
  const parts = [];
  parts.push(`Question: ${question.text}`);
  parts.push(`Question type: ${question.type}`);

  // For MC / TF include the options but NOT the correct answer
  if (
    question.type === QUESTION_TYPES.MULTIPLE_CHOICE ||
    question.type === QUESTION_TYPES.TRUE_FALSE
  ) {
    if (question.options && question.options.length > 0) {
      parts.push('Options:');
      question.options.forEach((opt, i) => {
        const label = typeof opt === 'object' ? opt.text || opt.label || String(opt) : String(opt);
        parts.push(`  ${String.fromCharCode(65 + i)}. ${label}`);
      });
    }
  }

  parts.push(`Student's answer: "${userAnswer}"`);
  parts.push(`Attempt number: ${attemptNumber}`);

  // Built-in hints from the question (if any)
  if (question.hints && question.hints.length > 0) {
    parts.push('Available hints from the question author:');
    question.hints.forEach((h, i) => {
      parts.push(`  ${i + 1}. ${h}`);
    });
  }

  // Previously shown hints
  if (previousHints && previousHints.length > 0) {
    parts.push('Hints already shown to the student (do not repeat these):');
    previousHints.forEach((h, i) => {
      parts.push(`  ${i + 1}. ${h}`);
    });
  }

  parts.push('');
  parts.push(
    'Provide an encouraging, progressively more specific hint based on the attempt number. ' +
    'Do NOT reveal the correct answer.',
  );

  return [
    { role: 'system', content: systemMessage },
    { role: 'user', content: parts.join('\n') },
  ];
}

/**
 * Build a grading prompt for assessment mode.
 *
 * The system message instructs the LLM to evaluate the response and return
 * structured JSON.  The user message includes the question, expected answer,
 * rubric, and the student's response.
 *
 * @param {object} question   The full question object.
 * @param {string} userAnswer The student's response.
 * @returns {Array<{role: string, content: string}>}
 */
export function buildGradingPrompt(question, userAnswer) {
  const maxPoints = question.points || 1;

  const systemMessage = [
    'You are an exam grader. Evaluate the response and return JSON.',
    '',
    'You MUST return ONLY valid JSON (no markdown fences, no commentary outside the JSON).',
    'The JSON must have this exact shape:',
    '{',
    `  "score": <number between 0 and ${maxPoints}>,`,
    '  "feedback": "<detailed feedback string>",',
    '  "isCorrect": <boolean>,',
    '  "misconceptions": ["<string>", ...]',
    '}',
    '',
    `Do not return a score greater than ${maxPoints}.`,
  ].join('\n');

  const parts = [];
  parts.push(`Question: ${question.question || question.text}`);
  parts.push(`Question type: ${question.type}`);
  parts.push(`Points available: ${maxPoints}`);

  // Expected / correct answer
  if (question.correctAnswer !== undefined) {
    parts.push(`Expected answer: ${JSON.stringify(question.correctAnswer)}`);
  } else if (question.expectedAnswer !== undefined) {
    parts.push(`Expected answer: ${JSON.stringify(question.expectedAnswer)}`);
  }

  // Rubric
  if (question.rubric) {
    parts.push(`Rubric: ${JSON.stringify(question.rubric)}`);
  }

  // Key points
  if (question.keyPoints && question.keyPoints.length > 0) {
    parts.push('Key points the answer should cover:');
    question.keyPoints.forEach((kp, i) => {
      parts.push(`  ${i + 1}. ${kp}`);
    });
  }

  parts.push(`Student's answer: "${userAnswer}"`);
  parts.push('');
  parts.push(
    'Evaluate the student\'s answer against the expected answer and rubric. ' +
    'Return ONLY the JSON object described above.',
  );

  return [
    { role: 'system', content: systemMessage },
    { role: 'user', content: parts.join('\n') },
  ];
}
