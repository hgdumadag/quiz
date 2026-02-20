import React from 'react';

export default function ProgressBar({ value = 0, max = 100, label, className = '', colorClass }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const color = colorClass || (pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-yellow-500');

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">{label}</span>
          <span className="text-gray-500">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
