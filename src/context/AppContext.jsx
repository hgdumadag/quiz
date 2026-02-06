import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { VIEWS, TOKEN_BUDGET } from '../utils/constants.js';
import storageManager from '../services/storage/StorageManager.js';
import LLMProviderFactory from '../services/llm/LLMProviderFactory.js';
import LLMService from '../services/llm/LLMService.js';
import TokenCounter from '../services/llm/TokenCounter.js';

const AppContext = createContext(null);

/**
 * AppProvider - global application state: user list, exams, assignments,
 * LLM configuration, view-based routing, and storage access.
 */
export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [llmConfig, setLlmConfig] = useState(null);
  const [llmService, setLlmService] = useState(null);
  const [tokenCounter, setTokenCounter] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [currentView, setCurrentView] = useState(VIEWS.ROLE_SELECT);
  const [viewParams, setViewParams] = useState(null);

  // Ref to avoid stale closures when building the LLM service
  const llmServiceRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Bootstrap: initialise storage and load persisted data
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await storageManager.init();

        if (cancelled) return;

        const loadedUsers = storageManager.getUsers();
        const loadedExams = await storageManager.getAllExams();
        const loadedAssignments = storageManager.getAssignments();
        const loadedLlmConfig = storageManager.getLLMConfig();

        setUsers(loadedUsers);
        setExams(loadedExams);
        setAssignments(loadedAssignments);
        setLlmConfig(loadedLlmConfig);

        // Initialise token counter
        const counter = new TokenCounter(TOKEN_BUDGET.MAX);
        // Restore persisted token usage if available
        const savedUsage = storageManager.getTokenUsage();
        if (savedUsage && typeof savedUsage.used === 'number') {
          counter.addUsage(savedUsage.used, 0);
        }
        setTokenCounter(counter);

        // Build LLM service from persisted config (if any)
        if (loadedLlmConfig && loadedLlmConfig.provider) {
          try {
            const provider = LLMProviderFactory.create(
              loadedLlmConfig.provider,
              loadedLlmConfig,
            );
            const service = new LLMService(provider);
            setLlmService(service);
            llmServiceRef.current = service;
          } catch {
            // LLM config invalid - continue without service
          }
        }

        setIsReady(true);
      } catch (err) {
        console.error('AppProvider bootstrap failed:', err);
        // Mark ready even on error so the UI can show an error state
        if (!cancelled) setIsReady(true);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Rebuild LLM service whenever llmConfig changes (after initial load)
  // ---------------------------------------------------------------------------
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!llmConfig || !llmConfig.provider) {
      setLlmService(null);
      llmServiceRef.current = null;
      return;
    }

    try {
      const provider = LLMProviderFactory.create(llmConfig.provider, llmConfig);
      // Reuse existing service instance if possible
      if (llmServiceRef.current) {
        llmServiceRef.current.setProvider(provider);
        // Force a new reference so consumers re-render
        setLlmService(Object.create(llmServiceRef.current));
      } else {
        const service = new LLMService(provider);
        setLlmService(service);
        llmServiceRef.current = service;
      }
    } catch {
      setLlmService(null);
      llmServiceRef.current = null;
    }
  }, [llmConfig]);

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  const navigate = useCallback((view, params = null) => {
    setCurrentView(view);
    setViewParams(params);
  }, []);

  // ---------------------------------------------------------------------------
  // User management
  // ---------------------------------------------------------------------------
  const addUser = useCallback((user) => {
    storageManager.saveUser(user);
    setUsers(storageManager.getUsers());
  }, []);

  const removeUser = useCallback((userId) => {
    storageManager.removeUser(userId);
    setUsers(storageManager.getUsers());
  }, []);

  // ---------------------------------------------------------------------------
  // Exam management
  // ---------------------------------------------------------------------------
  const loadExam = useCallback(async (examJson) => {
    await storageManager.saveExam(examJson);
    const allExams = await storageManager.getAllExams();
    setExams(allExams);
  }, []);

  const deleteExam = useCallback(async (examId) => {
    await storageManager.deleteExam(examId);
    const allExams = await storageManager.getAllExams();
    setExams(allExams);
  }, []);

  // ---------------------------------------------------------------------------
  // Assignments
  // ---------------------------------------------------------------------------
  const saveAssignments = useCallback((newAssignments) => {
    storageManager.saveAssignments(newAssignments);
    setAssignments([...newAssignments]);
  }, []);

  // ---------------------------------------------------------------------------
  // LLM config
  // ---------------------------------------------------------------------------
  const saveLLMConfig = useCallback((config) => {
    storageManager.saveLLMConfig(config);
    setLlmConfig(config);
  }, []);

  // ---------------------------------------------------------------------------
  // Refresh all data from storage
  // ---------------------------------------------------------------------------
  const refreshData = useCallback(async () => {
    const loadedUsers = storageManager.getUsers();
    const loadedExams = await storageManager.getAllExams();
    const loadedAssignments = storageManager.getAssignments();
    const loadedLlmConfig = storageManager.getLLMConfig();

    setUsers(loadedUsers);
    setExams(loadedExams);
    setAssignments(loadedAssignments);
    setLlmConfig(loadedLlmConfig);
  }, []);

  // ---------------------------------------------------------------------------
  // Context value
  // ---------------------------------------------------------------------------
  const value = useMemo(
    () => ({
      // State
      users,
      exams,
      assignments,
      llmConfig,
      llmService,
      tokenCounter,
      isReady,
      currentView,
      viewParams,
      storageManager,

      // Actions
      navigate,
      addUser,
      removeUser,
      loadExam,
      deleteExam,
      saveAssignments,
      saveLLMConfig,
      refreshData,
    }),
    [
      users,
      exams,
      assignments,
      llmConfig,
      llmService,
      tokenCounter,
      isReady,
      currentView,
      viewParams,
      navigate,
      addUser,
      removeUser,
      loadExam,
      deleteExam,
      saveAssignments,
      saveLLMConfig,
      refreshData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * useApp - convenience hook for consuming AppContext.
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
