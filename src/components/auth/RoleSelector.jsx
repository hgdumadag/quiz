import React from 'react';
import { ROLES } from '../../utils/constants.js';

const roles = [
  {
    id: ROLES.STUDENT,
    title: 'Student',
    description: 'Take exams, practice with AI coaching, and review results.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-4-3.5l4 2 4-2" />
      </svg>
    ),
  },
  {
    id: ROLES.ADMIN,
    title: 'Super Admin',
    description: 'Manage exams, users, assignments, and LLM configuration.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function RoleSelector({ onSelectRole }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Exam System</h1>
        <p className="text-gray-500">Select your role to continue</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role.id)}
            className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-md hover:shadow-lg border-2 border-transparent hover:border-blue-400 transition-all group"
          >
            <div className="text-blue-500 group-hover:text-blue-600 transition-colors">
              {role.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{role.title}</h2>
            <p className="text-sm text-gray-500 text-center">{role.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
