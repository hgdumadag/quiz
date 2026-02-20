import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext.jsx';

/**
 * TokenBudgetIndicator - compact indicator showing current token usage percentage.
 *
 * Reads from the TokenCounter instance exposed by AppContext.
 * - Default: gray/blue bar
 * - Warning (>80%): yellow bar
 * - Disabled (100%): red bar
 */
export default function TokenBudgetIndicator() {
  const { tokenCounter } = useApp();
  const [usage, setUsage] = useState(null);

  const refresh = useCallback(() => {
    if (tokenCounter) {
      setUsage(tokenCounter.getUsage());
    }
  }, [tokenCounter]);

  // Poll every 5 seconds so the indicator stays reasonably up-to-date
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  if (!usage) return null;

  const pct = Math.round(usage.percentage);

  // Determine color scheme
  let barColor = 'bg-blue-500';
  let textColor = 'text-gray-500';
  if (usage.disabled) {
    barColor = 'bg-red-500';
    textColor = 'text-red-600';
  } else if (usage.warning) {
    barColor = 'bg-yellow-500';
    textColor = 'text-yellow-600';
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium whitespace-nowrap ${textColor}`}>
        Tokens: {pct}% used
      </span>
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
