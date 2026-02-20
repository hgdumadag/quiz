import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ROLES, STORAGE_KEYS } from '../utils/constants.js';

const AuthContext = createContext(null);

/**
 * AuthProvider - manages authentication state (current user and role).
 * Persists to localStorage so state survives page reloads.
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) || null;
    } catch {
      return null;
    }
  });

  const selectRole = useCallback((role) => {
    setCurrentRole(role);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
    } catch {
      // storage full or unavailable
    }
  }, []);

  const login = useCallback((user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch {
      // storage full or unavailable
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCurrentRole(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ROLE);
    } catch {
      // storage unavailable
    }
  }, []);

  const switchUser = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch {
      // storage unavailable
    }
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      currentRole,
      isLoggedIn: currentUser !== null,
      isAdmin: currentRole === ROLES.ADMIN,
      isStudent: currentRole === ROLES.STUDENT,
      selectRole,
      login,
      logout,
      switchUser,
    }),
    [currentUser, currentRole, selectRole, login, logout, switchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth - convenience hook for consuming AuthContext.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
