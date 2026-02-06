import { safeJsonParse } from '../../utils/helpers.js';

/**
 * Thin wrapper around localStorage with safe JSON serialisation.
 * All values are stored as JSON strings.
 */
class LocalStorageAdapter {
  /**
   * Retrieve a value by key.
   * @param {string} key
   * @returns {*} Parsed value, or null if not found / parse fails.
   */
  get(key) {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return safeJsonParse(raw);
  }

  /**
   * Store a value under the given key (JSON-serialised).
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Remove a key from localStorage.
   * @param {string} key
   */
  remove(key) {
    localStorage.removeItem(key);
  }

  /**
   * Check whether a key exists in localStorage.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  }
}

export default LocalStorageAdapter;
