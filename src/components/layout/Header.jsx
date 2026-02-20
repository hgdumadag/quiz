import React from 'react';
import { APP_VERSION } from '../../utils/constants.js';

export default function Header({ currentUser, currentRole, onLogout, onSwitchUser, onToggleSidebar }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Interactive Exam System</h1>
        <span className="text-xs text-gray-400 hidden sm:inline">v{APP_VERSION}</span>
      </div>

      {currentUser && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-700">{currentUser.name}</div>
            <div className="text-xs text-gray-400 capitalize">{currentRole}</div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onSwitchUser}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Switch user"
            >
              Switch
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
