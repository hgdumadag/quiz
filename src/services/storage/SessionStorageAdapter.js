import { safeJsonParse } from '../../utils/helpers.js';

/**
 * Thin wrapper around sessionStorage with safe JSON serialisation.
 * All values are stored as JSON strings.
 */
class SessionStorageAdapter {
  /**
   * Retrieve a value by key.
   * @param {string} key
   * @returns {*} Parsed value, or null if not found / parse fails.
   */
  get(key) {
    const raw = sessionStorage.getItem(key);
    if (raw === null) return null;
    return safeJsonParse(raw);
  }

  /**
   * Store a value under the given key (JSON-serialised).
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Remove a key from sessionStorage.
   * @param {string} key
   */
  remove(key) {
    sessionStorage.removeItem(key);
  }

  /**
   * Remove all keys from sessionStorage.
   */
  clear() {
    sessionStorage.clear();
  }
}

export default SessionStorageAdapter;
