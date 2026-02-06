// Roles
export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
};

// Exam modes
export const EXAM_MODES = {
  PRACTICE: 'practice',
  ASSESSMENT: 'assessment',
};

// Question types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple-choice',
  TRUE_FALSE: 'true-false',
  SHORT_ANSWER: 'short-answer',
  LONG_ANSWER: 'long-answer',
};

// Question status during exam
export const QUESTION_STATUS = {
  UNANSWERED: 'unanswered',
  ANSWERED: 'answered',
  FLAGGED: 'flagged',
  LOCKED: 'locked',
  CURRENT: 'current',
};

// Exam session status
export const SESSION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
  TIMED_OUT: 'timed_out',
};

// Storage keys
export const STORAGE_KEYS = {
  USERS: 'ies_users',
  CONFIG: 'ies_config',
  ASSIGNMENTS: 'ies_assignments',
  CURRENT_USER: 'ies_current_user',
  CURRENT_ROLE: 'ies_current_role',
  LLM_CONFIG: 'ies_llm_config',
  SESSION_STATE: 'ies_session_state',
  TOKEN_USAGE: 'ies_token_usage',
};

// IndexedDB
export const IDB_NAME = 'InteractiveExamSystem';
export const IDB_VERSION = 1;
export const IDB_STORES = {
  EXAMS: 'exams',
  EXAM_SESSIONS: 'examSessions',
  QUESTION_RESPONSES: 'questionResponses',
  RESULTS: 'results',
};

// Token budget
export const TOKEN_BUDGET = {
  MAX: 500000,
  WARNING_THRESHOLD: 0.8,
  DISABLE_THRESHOLD: 1.0,
};

// Timer warnings (seconds remaining)
export const TIMER_WARNINGS = {
  TEN_MINUTES: 600,
  TWO_MINUTES: 120,
};

// Auto-save interval (ms)
export const AUTO_SAVE_INTERVAL = 30000;

// LLM
export const LLM_PROVIDERS = {
  CLAUDE: 'claude',
  OPENAI: 'openai',
  OLLAMA: 'ollama',
  LMSTUDIO: 'lmstudio',
};

export const LLM_DEFAULTS = {
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  BACKOFF_BASE: 1000,
};

// Views (state-based routing)
export const VIEWS = {
  ROLE_SELECT: 'role_select',
  USER_LOGIN: 'user_login',
  STUDENT_DASHBOARD: 'student_dashboard',
  EXAM_LIST: 'exam_list',
  EXAM_DETAIL: 'exam_detail',
  EXAM_TAKING: 'exam_taking',
  RESULTS_DASHBOARD: 'results_dashboard',
  ADMIN_DASHBOARD: 'admin_dashboard',
  ADMIN_EXAMS: 'admin_exams',
  ADMIN_USERS: 'admin_users',
  ADMIN_ASSIGNMENTS: 'admin_assignments',
  ADMIN_LLM_CONFIG: 'admin_llm_config',
  ADMIN_RESULTS: 'admin_results',
};

// App version
export const APP_VERSION = '1.0.0';
