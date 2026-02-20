import { STORAGE_KEYS, IDB_STORES } from '../../utils/constants.js';
import IndexedDBAdapter from './IndexedDBAdapter.js';
import LocalStorageAdapter from './LocalStorageAdapter.js';
import SessionStorageAdapter from './SessionStorageAdapter.js';

/**
 * Facade that combines IndexedDB, localStorage, and sessionStorage adapters
 * into a single, domain-aware API for the Interactive Exam System.
 */
class StorageManager {
  constructor() {
    this.idb = new IndexedDBAdapter();
    this.local = new LocalStorageAdapter();
    this.session = new SessionStorageAdapter();
  }

  // ---------------------------------------------------------------------------
  // Initialisation
  // ---------------------------------------------------------------------------

  /**
   * Initialise the IndexedDB database (must be called before IDB operations).
   * @returns {Promise<void>}
   */
  async init() {
    await this.idb.init();
  }

  // ---------------------------------------------------------------------------
  // User operations (localStorage)
  // ---------------------------------------------------------------------------

  /**
   * Get the list of registered users.
   * @returns {Array}
   */
  getUsers() {
    return this.local.get(STORAGE_KEYS.USERS) || [];
  }

  /**
   * Save (add or update) a single user.
   * If a user with the same id already exists it is replaced.
   * @param {object} user
   */
  saveUser(user) {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.local.set(STORAGE_KEYS.USERS, users);
  }

  /**
   * Remove a user by id.
   * @param {string} userId
   */
  removeUser(userId) {
    const users = this.getUsers().filter((u) => u.id !== userId);
    this.local.set(STORAGE_KEYS.USERS, users);
  }

  // ---------------------------------------------------------------------------
  // Config operations (localStorage)
  // ---------------------------------------------------------------------------

  /**
   * Get the application configuration object.
   * @returns {object|null}
   */
  getConfig() {
    return this.local.get(STORAGE_KEYS.CONFIG);
  }

  /**
   * Save the application configuration object.
   * @param {object} config
   */
  saveConfig(config) {
    this.local.set(STORAGE_KEYS.CONFIG, config);
  }

  /**
   * Get the LLM provider configuration.
   * @returns {object|null}
   */
  getLLMConfig() {
    return this.local.get(STORAGE_KEYS.LLM_CONFIG);
  }

  /**
   * Save the LLM provider configuration.
   * @param {object} config
   */
  saveLLMConfig(config) {
    this.local.set(STORAGE_KEYS.LLM_CONFIG, config);
  }

  // ---------------------------------------------------------------------------
  // Assignment operations (localStorage)
  // ---------------------------------------------------------------------------

  /**
   * Get all exam-to-user assignments.
   * @returns {Array}
   */
  getAssignments() {
    return this.local.get(STORAGE_KEYS.ASSIGNMENTS) || [];
  }

  /**
   * Overwrite the full assignments list.
   * @param {Array} assignments
   */
  saveAssignments(assignments) {
    this.local.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
  }

  // ---------------------------------------------------------------------------
  // Exam operations (IndexedDB)
  // ---------------------------------------------------------------------------

  /**
   * Persist an exam object.
   * @param {object} exam
   * @returns {Promise<*>}
   */
  async saveExam(exam) {
    return this.idb.put(IDB_STORES.EXAMS, exam);
  }

  /**
   * Retrieve a single exam by its id.
   * @param {string} id
   * @returns {Promise<object|undefined>}
   */
  async getExam(id) {
    return this.idb.getById(IDB_STORES.EXAMS, id);
  }

  /**
   * Retrieve every exam in the store.
   * @returns {Promise<Array>}
   */
  async getAllExams() {
    return this.idb.getAll(IDB_STORES.EXAMS);
  }

  /**
   * Delete an exam by its id.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteExam(id) {
    return this.idb.delete(IDB_STORES.EXAMS, id);
  }

  // ---------------------------------------------------------------------------
  // Session operations (IndexedDB)
  // ---------------------------------------------------------------------------

  /**
   * Persist an exam session.
   * @param {object} session
   * @returns {Promise<*>}
   */
  async saveSession(session) {
    return this.idb.put(IDB_STORES.EXAM_SESSIONS, session);
  }

  /**
   * Retrieve a session by its id.
   * @param {string} id
   * @returns {Promise<object|undefined>}
   */
  async getSession(id) {
    return this.idb.getById(IDB_STORES.EXAM_SESSIONS, id);
  }

  /**
   * Get all sessions belonging to a given user.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getSessionsForUser(userId) {
    return this.idb.getByIndex(IDB_STORES.EXAM_SESSIONS, 'userId', userId);
  }

  /**
   * Get all sessions associated with a given exam.
   * @param {string} examId
   * @returns {Promise<Array>}
   */
  async getSessionsForExam(examId) {
    return this.idb.getByIndex(IDB_STORES.EXAM_SESSIONS, 'examId', examId);
  }

  // ---------------------------------------------------------------------------
  // Response operations (IndexedDB)
  // ---------------------------------------------------------------------------

  /**
   * Persist a question response.
   * @param {object} response
   * @returns {Promise<*>}
   */
  async saveResponse(response) {
    return this.idb.put(IDB_STORES.QUESTION_RESPONSES, response);
  }

  /**
   * Get all responses for a given session.
   * @param {string} sessionId
   * @returns {Promise<Array>}
   */
  async getResponsesForSession(sessionId) {
    return this.idb.getByIndex(IDB_STORES.QUESTION_RESPONSES, 'sessionId', sessionId);
  }

  // ---------------------------------------------------------------------------
  // Result operations (IndexedDB)
  // ---------------------------------------------------------------------------

  /**
   * Persist an exam result.
   * @param {object} result
   * @returns {Promise<*>}
   */
  async saveResult(result) {
    return this.idb.put(IDB_STORES.RESULTS, result);
  }

  /**
   * Retrieve a single result by id.
   * @param {string} id
   * @returns {Promise<object|undefined>}
   */
  async getResult(id) {
    return this.idb.getById(IDB_STORES.RESULTS, id);
  }

  /**
   * Get all results for a given user.
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  async getResultsForUser(userId) {
    return this.idb.getByIndex(IDB_STORES.RESULTS, 'userId', userId);
  }

  /**
   * Get all results for a given exam.
   * @param {string} examId
   * @returns {Promise<Array>}
   */
  async getResultsForExam(examId) {
    return this.idb.getByIndex(IDB_STORES.RESULTS, 'examId', examId);
  }

  /**
   * Get every result record.
   * @returns {Promise<Array>}
   */
  async getAllResults() {
    return this.idb.getAll(IDB_STORES.RESULTS);
  }

  // ---------------------------------------------------------------------------
  // Session state (sessionStorage)
  // ---------------------------------------------------------------------------

  /**
   * Save in-progress exam session state (e.g. current question index, timer).
   * @param {object} state
   */
  setSessionState(state) {
    this.session.set(STORAGE_KEYS.SESSION_STATE, state);
  }

  /**
   * Retrieve the in-progress session state.
   * @returns {object|null}
   */
  getSessionState() {
    return this.session.get(STORAGE_KEYS.SESSION_STATE);
  }

  /**
   * Clear the in-progress session state.
   */
  clearSessionState() {
    this.session.remove(STORAGE_KEYS.SESSION_STATE);
  }

  // ---------------------------------------------------------------------------
  // Token usage (sessionStorage)
  // ---------------------------------------------------------------------------

  /**
   * Retrieve the current token usage object.
   * @returns {object|null}
   */
  getTokenUsage() {
    return this.session.get(STORAGE_KEYS.TOKEN_USAGE);
  }

  /**
   * Save the current token usage object.
   * @param {object} usage
   */
  setTokenUsage(usage) {
    this.session.set(STORAGE_KEYS.TOKEN_USAGE, usage);
  }
}

// Export a singleton instance as the default export
const storageManager = new StorageManager();
export default storageManager;
