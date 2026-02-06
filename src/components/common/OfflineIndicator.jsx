import React, { useState, useEffect } from 'react';

/**
 * OfflineIndicator - renders a top banner when the browser is offline.
 *
 * Listens to the `online` and `offline` window events and hides
 * automatically once connectivity is restored.
 */
export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  );

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 text-center text-sm font-medium py-2 px-4 shadow-md">
      <div className="flex items-center justify-center gap-2">
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728M12 9v4m0 4h.01"
          />
        </svg>
        You are offline. Some features may be unavailable.
      </div>
    </div>
  );
}
