import { QUESTION_TYPES } from '../utils/constants.js';
import {
  VALID_QUESTION_TYPES,
  VALID_DIFFICULTIES,
  VALID_MODES,
  LIMITS,
  METADATA_ID_PATTERN,
  VERSION_PATTERN,
  QUESTION_ID_PATTERN,
} from '../utils/examSchema.js';

/**
 * Hand-written exam JSON validator.
 * Returns { valid: boolean, errors: string[], warnings: string[] }.
 */
export class ExamValidator {
  static validate(json) {
    const errors = [];
    const warnings = [];

    if (!json || typeof json !== 'object') {
      return { valid: false, errors: ['Input is not a valid object.'], warnings };
    }

    ExamValidator._validateMetadata(json.examMetadata, errors, warnings);
    ExamValidator._validateQuestions(json.questions, errors, warnings);
    ExamValidator._validateSettings(json.settings, warnings);

    return { valid: errors.length === 0, errors, warnings };
  }

  static _validateMetadata(meta, errors, warnings) {
    if (!meta || typeof meta !== 'object') {
      errors.push('Missing required field: examMetadata');
      return;
    }

    // Required fields
    if (!meta.id || typeof meta.id !== 'string') {
      errors.push('examMetadata.id is required and must be a string.');
    } else if (!METADATA_ID_PATTERN.test(meta.id)) {
      errors.push('examMetadata.id must match pattern: lowercase letters, numbers, and hyphens only.');
    }

    if (!meta.title || typeof meta.title !== 'string') {
      errors.push('examMetadata.title is required and must be a non-empty string.');
    } else if (meta.title.length > LIMITS.TITLE_MAX) {
      errors.push(`examMetadata.title must be at most ${LIMITS.TITLE_MAX} characters.`);
    }

    if (!meta.subject || typeof meta.subject !== 'string') {
      errors.push('examMetadata.subject is required and must be a string.');
    }

    // Optional fields
    if (meta.description !== undefined) {
      if (typeof meta.description !== 'string') {
        errors.push('examMetadata.description must be a string.');
      } else if (meta.description.length > LIMITS.DESCRIPTION_MAX) {
        warnings.push(`examMetadata.description exceeds ${LIMITS.DESCRIPTION_MAX} characters.`);
      }
    }

    if (meta.version !== undefined) {
      if (typeof meta.version !== 'string' || !VERSION_PATTERN.test(meta.version)) {
        warnings.push('examMetadata.version should follow semantic versioning (e.g., "1.0" or "2.1.3").');
      }
    }

    if (meta.author !== undefined && typeof meta.author !== 'string') {
      warnings.push('examMetadata.author should be a string.');
    }

    if (meta.timeLimit !== undefined) {
      if (typeof meta.timeLimit !== 'number' || !Number.isInteger(meta.timeLimit)) {
        errors.push('examMetadata.timeLimit must be an integer.');
      } else if (meta.timeLimit < LIMITS.TIME_LIMIT_MIN || meta.timeLimit > LIMITS.TIME_LIMIT_MAX) {
        errors.push(`examMetadata.timeLimit must be between ${LIMITS.TIME_LIMIT_MIN} and ${LIMITS.TIME_LIMIT_MAX} minutes.`);
      }
    } else {
      warnings.push('examMetadata.timeLimit not set. Assessment mode will have no timer.');
    }

    if (meta.passingScore !== undefined) {
      if (typeof meta.passingScore !== 'number') {
        errors.push('examMetadata.passingScore must be a number.');
      } else if (meta.passingScore < LIMITS.PASSING_SCORE_MIN || meta.passingScore > LIMITS.PASSING_SCORE_MAX) {
        errors.push(`examMetadata.passingScore must be between ${LIMITS.PASSING_SCORE_MIN} and ${LIMITS.PASSING_SCORE_MAX}.`);
      }
    }

    if (meta.allowedModes !== undefined) {
      if (!Array.isArray(meta.allowedModes) || meta.allowedModes.length < 1) {
        errors.push('examMetadata.allowedModes must be a non-empty array.');
      } else {
        for (const mode of meta.allowedModes) {
          if (!VALID_MODES.includes(mode)) {
            errors.push(`examMetadata.allowedModes contains invalid mode: "${mode}". Valid: ${VALID_MODES.join(', ')}`);
          }
        }
      }
    }
  }

  static _validateQuestions(questions, errors, warnings) {
    if (!Array.isArray(questions)) {
      errors.push('Missing required field: questions (must be an array).');
      return;
    }

    if (questions.length < LIMITS.QUESTIONS_MIN) {
      errors.push(`Exam must have at least ${LIMITS.QUESTIONS_MIN} question.`);
      return;
    }

    if (questions.length > LIMITS.QUESTIONS_MAX) {
      errors.push(`Exam cannot have more than ${LIMITS.QUESTIONS_MAX} questions.`);
    }

    const seenIds = new Set();
    questions.forEach((q, i) => {
      const prefix = `questions[${i}]`;

      if (!q || typeof q !== 'object') {
        errors.push(`${prefix}: must be an object.`);
        return;
      }

      // id
      if (!q.id || typeof q.id !== 'string') {
        errors.push(`${prefix}.id is required and must be a string.`);
      } else {
        if (!QUESTION_ID_PATTERN.test(q.id)) {
          errors.push(`${prefix}.id "${q.id}" must match pattern: q followed by numbers (e.g., "q1").`);
        }
        if (seenIds.has(q.id)) {
          errors.push(`${prefix}.id "${q.id}" is duplicated.`);
        }
        seenIds.add(q.id);
      }

      // type
      if (!q.type || !VALID_QUESTION_TYPES.includes(q.type)) {
        errors.push(`${prefix}.type must be one of: ${VALID_QUESTION_TYPES.join(', ')}`);
        return; // can't validate type-specific fields
      }

      // question text
      if (!q.question || typeof q.question !== 'string') {
        errors.push(`${prefix}.question is required and must be a non-empty string.`);
      } else if (q.question.length > LIMITS.QUESTION_TEXT_MAX) {
        errors.push(`${prefix}.question exceeds ${LIMITS.QUESTION_TEXT_MAX} characters.`);
      }

      // points
      if (q.points === undefined || typeof q.points !== 'number' || !Number.isInteger(q.points)) {
        errors.push(`${prefix}.points is required and must be an integer.`);
      } else if (q.points < LIMITS.POINTS_MIN || q.points > LIMITS.POINTS_MAX) {
        errors.push(`${prefix}.points must be between ${LIMITS.POINTS_MIN} and ${LIMITS.POINTS_MAX}.`);
      }

      // optional: category, difficulty
      if (q.difficulty !== undefined && !VALID_DIFFICULTIES.includes(q.difficulty)) {
        warnings.push(`${prefix}.difficulty "${q.difficulty}" is not one of: ${VALID_DIFFICULTIES.join(', ')}`);
      }

      // hints
      if (q.hints !== undefined) {
        if (!Array.isArray(q.hints)) {
          warnings.push(`${prefix}.hints should be an array of strings.`);
        } else if (q.hints.length > LIMITS.HINTS_MAX) {
          warnings.push(`${prefix}.hints exceeds maximum of ${LIMITS.HINTS_MAX}.`);
        }
      }

      // Type-specific validation
      ExamValidator._validateByType(q, prefix, errors, warnings);
    });
  }

  static _validateByType(q, prefix, errors, warnings) {
    switch (q.type) {
      case QUESTION_TYPES.MULTIPLE_CHOICE:
        ExamValidator._validateMC(q, prefix, errors, warnings);
        break;
      case QUESTION_TYPES.TRUE_FALSE:
        ExamValidator._validateTF(q, prefix, errors, warnings);
        break;
      case QUESTION_TYPES.SHORT_ANSWER:
        ExamValidator._validateSA(q, prefix, errors, warnings);
        break;
      case QUESTION_TYPES.LONG_ANSWER:
        ExamValidator._validateLA(q, prefix, errors, warnings);
        break;
    }
  }

  static _validateMC(q, prefix, errors, warnings) {
    if (!Array.isArray(q.options)) {
      errors.push(`${prefix}: multiple-choice requires "options" array.`);
    } else {
      if (q.options.length < LIMITS.MC_OPTIONS_MIN || q.options.length > LIMITS.MC_OPTIONS_MAX) {
        errors.push(`${prefix}.options must have between ${LIMITS.MC_OPTIONS_MIN} and ${LIMITS.MC_OPTIONS_MAX} items.`);
      }
      if (!q.options.every((o) => typeof o === 'string' && o.length > 0)) {
        errors.push(`${prefix}.options must all be non-empty strings.`);
      }
    }

    if (q.correctAnswer === undefined || typeof q.correctAnswer !== 'number' || !Number.isInteger(q.correctAnswer)) {
      errors.push(`${prefix}: multiple-choice requires "correctAnswer" as an integer index.`);
    } else if (Array.isArray(q.options) && (q.correctAnswer < 0 || q.correctAnswer >= q.options.length)) {
      errors.push(`${prefix}.correctAnswer index ${q.correctAnswer} is out of range (0-${q.options.length - 1}).`);
    }

    if (q.explanation === undefined) {
      warnings.push(`${prefix}: no explanation provided for multiple-choice question.`);
    }
  }

  static _validateTF(q, prefix, errors, warnings) {
    if (q.correctAnswer === undefined || typeof q.correctAnswer !== 'boolean') {
      errors.push(`${prefix}: true-false requires "correctAnswer" as a boolean.`);
    }

    if (q.explanation === undefined) {
      warnings.push(`${prefix}: no explanation provided for true-false question.`);
    }
  }

  static _validateSA(q, prefix, errors, warnings) {
    if (!q.rubric || typeof q.rubric !== 'object') {
      errors.push(`${prefix}: short-answer requires "rubric" object.`);
    } else if (!Array.isArray(q.rubric.keyPoints) || q.rubric.keyPoints.length === 0) {
      errors.push(`${prefix}.rubric.keyPoints is required and must be a non-empty array.`);
    }

    if (!q.expectedAnswer || typeof q.expectedAnswer !== 'string') {
      errors.push(`${prefix}: short-answer requires "expectedAnswer" string.`);
    }

    if (q.maxLength !== undefined) {
      if (typeof q.maxLength !== 'number' || !Number.isInteger(q.maxLength)) {
        errors.push(`${prefix}.maxLength must be an integer.`);
      } else if (q.maxLength < LIMITS.SHORT_ANSWER_MAX_LENGTH_MIN || q.maxLength > LIMITS.SHORT_ANSWER_MAX_LENGTH_MAX) {
        warnings.push(`${prefix}.maxLength should be between ${LIMITS.SHORT_ANSWER_MAX_LENGTH_MIN} and ${LIMITS.SHORT_ANSWER_MAX_LENGTH_MAX}.`);
      }
    }
  }

  static _validateLA(q, prefix, errors, warnings) {
    if (!q.rubric || typeof q.rubric !== 'object') {
      errors.push(`${prefix}: long-answer requires "rubric" object.`);
    } else {
      if (!Array.isArray(q.rubric.keyPoints) || q.rubric.keyPoints.length === 0) {
        errors.push(`${prefix}.rubric.keyPoints is required and must be a non-empty array.`);
      }
      if (!q.rubric.gradingCriteria || typeof q.rubric.gradingCriteria !== 'object') {
        errors.push(`${prefix}.rubric.gradingCriteria is required for long-answer.`);
      } else {
        const required = ['excellent', 'good', 'satisfactory', 'needs-improvement', 'incorrect'];
        for (const key of required) {
          if (!q.rubric.gradingCriteria[key]) {
            errors.push(`${prefix}.rubric.gradingCriteria.${key} is required.`);
          }
        }
      }
    }

    if (!q.expectedAnswer || typeof q.expectedAnswer !== 'string') {
      errors.push(`${prefix}: long-answer requires "expectedAnswer" string.`);
    }

    if (q.maxLength !== undefined) {
      if (typeof q.maxLength !== 'number' || !Number.isInteger(q.maxLength)) {
        errors.push(`${prefix}.maxLength must be an integer.`);
      } else if (q.maxLength < LIMITS.LONG_ANSWER_MAX_LENGTH_MIN || q.maxLength > LIMITS.LONG_ANSWER_MAX_LENGTH_MAX) {
        warnings.push(`${prefix}.maxLength should be between ${LIMITS.LONG_ANSWER_MAX_LENGTH_MIN} and ${LIMITS.LONG_ANSWER_MAX_LENGTH_MAX}.`);
      }
    }
  }

  static _validateSettings(settings, warnings) {
    if (settings === undefined) return;
    if (typeof settings !== 'object') {
      warnings.push('settings should be an object.');
      return;
    }

    if (settings.practiceMode !== undefined && typeof settings.practiceMode !== 'object') {
      warnings.push('settings.practiceMode should be an object.');
    }

    if (settings.assessmentMode !== undefined && typeof settings.assessmentMode !== 'object') {
      warnings.push('settings.assessmentMode should be an object.');
    }
  }
}
