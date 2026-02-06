import { useState, useEffect, useRef } from 'react';
import storageManager from '../services/storage/StorageManager.js';

/**
 * useStorage - custom hook that wraps StorageManager.
 * Calls storageManager.init() on mount and exposes readiness state.
 *
 * @returns {{ storageManager: StorageManager, isReady: boolean, error: Error|null }}
 */
export function useStorage() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const initCalled = useRef(false);

  useEffect(() => {
    // Guard against double-init in StrictMode
    if (initCalled.current) return;
    initCalled.current = true;

    let cancelled = false;

    async function initialize() {
      try {
        await storageManager.init();
        if (!cancelled) {
          setIsReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          console.error('useStorage: initialization failed', err);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  return { storageManager, isReady, error };
}

export default useStorage;
