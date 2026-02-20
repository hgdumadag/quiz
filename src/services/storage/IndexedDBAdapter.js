import { IDB_NAME, IDB_VERSION, IDB_STORES } from '../../utils/constants.js';

/**
 * Promise-based wrapper around IndexedDB.
 * Database: 'InteractiveExamSystem', version 1
 * Stores: exams, examSessions, questionResponses, results
 */
class IndexedDBAdapter {
  constructor() {
    this.db = null;
    this.dbName = IDB_NAME;
    this.dbVersion = IDB_VERSION;
  }

  /**
   * Open (or create) the database and set up object stores on upgrade.
   * @returns {Promise<IDBDatabase>}
   */
  init() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // exams store — keyPath nested in examMetadata.id
        if (!db.objectStoreNames.contains(IDB_STORES.EXAMS)) {
          db.createObjectStore(IDB_STORES.EXAMS, { keyPath: 'examMetadata.id' });
        }

        // examSessions store
        if (!db.objectStoreNames.contains(IDB_STORES.EXAM_SESSIONS)) {
          const sessionStore = db.createObjectStore(IDB_STORES.EXAM_SESSIONS, { keyPath: 'id' });
          sessionStore.createIndex('userId', 'userId', { unique: false });
          sessionStore.createIndex('examId', 'examId', { unique: false });
          sessionStore.createIndex('status', 'status', { unique: false });
        }

        // questionResponses store
        if (!db.objectStoreNames.contains(IDB_STORES.QUESTION_RESPONSES)) {
          const responseStore = db.createObjectStore(IDB_STORES.QUESTION_RESPONSES, { keyPath: 'id' });
          responseStore.createIndex('sessionId', 'sessionId', { unique: false });
          responseStore.createIndex('questionId', 'questionId', { unique: false });
        }

        // results store
        if (!db.objectStoreNames.contains(IDB_STORES.RESULTS)) {
          const resultStore = db.createObjectStore(IDB_STORES.RESULTS, { keyPath: 'id' });
          resultStore.createIndex('userId', 'userId', { unique: false });
          resultStore.createIndex('examId', 'examId', { unique: false });
          resultStore.createIndex('sessionId', 'sessionId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(new Error(`IndexedDB open failed: ${event.target.error?.message}`));
      };
    });
  }

  /**
   * Ensure the database is initialised before any operation.
   * @returns {Promise<IDBDatabase>}
   */
  async _ensureDb() {
    if (!this.db) {
      await this.init();
    }
    return this.db;
  }

  /**
   * Retrieve all records from a given object store.
   * @param {string} storeName
   * @returns {Promise<Array>}
   */
  async getAll(storeName) {
    const db = await this._ensureDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`getAll(${storeName}) failed: ${request.error?.message}`));
    });
  }

  /**
   * Retrieve a single record by its primary key.
   * @param {string} storeName
   * @param {*} id
   * @returns {Promise<*>}  The record, or undefined if not found.
   */
  async getById(storeName, id) {
    const db = await this._ensureDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`getById(${storeName}, ${id}) failed: ${request.error?.message}`));
    });
  }

  /**
   * Insert or update a record (put semantics).
   * @param {string} storeName
   * @param {object} item
   * @returns {Promise<*>}  The key of the stored record.
   */
  async put(storeName, item) {
    const db = await this._ensureDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`put(${storeName}) failed: ${request.error?.message}`));
    });
  }

  /**
   * Delete a record by primary key.
   * @param {string} storeName
   * @param {*} id
   * @returns {Promise<void>}
   */
  async delete(storeName, id) {
    const db = await this._ensureDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`delete(${storeName}, ${id}) failed: ${request.error?.message}`));
    });
  }

  /**
   * Query records using an index.
   * @param {string} storeName
   * @param {string} indexName
   * @param {*} value
   * @returns {Promise<Array>}
   */
  async getByIndex(storeName, indexName, value) {
    const db = await this._ensureDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`getByIndex(${storeName}, ${indexName}) failed: ${request.error?.message}`));
    });
  }

  /**
   * Remove all records from a store.
   * @param {string} storeName
   * @returns {Promise<void>}
   */
  async clear(storeName) {
    const db = await this._ensureDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`clear(${storeName}) failed: ${request.error?.message}`));
    });
  }
}

export default IndexedDBAdapter;
