import React from 'react';

export default function LoadingSpinner({ size = 'md', message }) {
  const sizeClass = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size] || 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <div
        className={`${sizeClass} border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin`}
      />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}
