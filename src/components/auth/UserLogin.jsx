import React, { useState } from 'react';
import { generateId } from '../../utils/helpers.js';

export default function UserLogin({ role, users, onLogin, onBack, onCreateUser }) {
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const roleUsers = users.filter((u) => u.role === role);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const user = { id: generateId(), name, role, createdAt: Date.now() };
    onCreateUser(user);
    onLogin(user);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to role selection
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {role === 'admin' ? 'Admin' : 'Student'} Login
        </h2>
        <p className="text-sm text-gray-500 mb-6">Select an existing profile or create a new one.</p>

        {roleUsers.length > 0 && (
          <div className="space-y-2 mb-6">
            {roleUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onLogin(user)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="border-t pt-4">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors text-sm"
            >
              + Create new profile
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Enter name"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => { setIsCreating(false); setNewName(''); }}
                className="px-3 py-2 text-gray-400 hover:text-gray-600 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
