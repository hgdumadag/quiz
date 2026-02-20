import React from 'react';
import { formatTime } from '../../utils/helpers.js';

export default function Timer({ timeRemaining, isWarning, isCritical }) {
  const colorClass = isCritical
    ? 'text-red-600 animate-pulse'
    : isWarning
      ? 'text-orange-500'
      : 'text-gray-700';

  return (
    <div className={`flex items-center gap-2 font-mono text-lg font-semibold ${colorClass}`}>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{formatTime(timeRemaining)}</span>
    </div>
  );
}
