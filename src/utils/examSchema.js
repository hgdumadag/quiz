import { QUESTION_TYPES } from './constants.js';

/**
 * Exam JSON validation rules matching the schema from Section 7.1.
 * Used by ExamValidator to produce structured error/warning lists.
 */

const METADATA_ID_PATTERN = /^[a-z0-9-]+$/;
const VERSION_PATTERN = /^\d+\.\d+(\.\d+)?$/;
const QUESTION_ID_PATTERN = /^q[0-9]+$/;

export const VALID_QUESTION_TYPES = Object.values(QUESTION_TYPES);
export const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
export const VALID_MODES = ['practice', 'assessment'];

export const LIMITS = {
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 1000,
  QUESTION_TEXT_MAX: 2000,
  MC_OPTIONS_MIN: 2,
  MC_OPTIONS_MAX: 10,
  HINTS_MAX: 3,
  QUESTIONS_MIN: 1,
  QUESTIONS_MAX: 100,
  POINTS_MIN: 1,
  POINTS_MAX: 20,
  TIME_LIMIT_MIN: 1,
  TIME_LIMIT_MAX: 480,
  PASSING_SCORE_MIN: 0,
  PASSING_SCORE_MAX: 100,
  SHORT_ANSWER_MAX_LENGTH_MIN: 50,
  SHORT_ANSWER_MAX_LENGTH_MAX: 500,
  LONG_ANSWER_MAX_LENGTH_MIN: 200,
  LONG_ANSWER_MAX_LENGTH_MAX: 2000,
};

export { METADATA_ID_PATTERN, VERSION_PATTERN, QUESTION_ID_PATTERN };
