import React, { useCallback, useEffect } from 'react';
import { VIEWS, ROLES, SESSION_STATUS } from './utils/constants.js';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { ExamProvider, useExam } from './context/ExamContext.jsx';
import { ToastProvider } from './components/common/Toast.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';
import OfflineIndicator from './components/common/OfflineIndicator.jsx';
import RoleSelector from './components/auth/RoleSelector.jsx';
import UserLogin from './components/auth/UserLogin.jsx';
import AppShell from './components/layout/AppShell.jsx';

// Lazy-ish imports — all bundled but split by view for readability
import StudentDashboard from './components/student/Dashboard.jsx';
import ExamList from './components/student/ExamList.jsx';
import ExamDetail from './components/student/ExamDetail.jsx';
import ExamTaker from './components/student/ExamTaker.jsx';
import ResultsDashboard from './components/student/ResultsDashboard.jsx';
import AdminDashboard from './components/admin/Dashboard.jsx';
import ExamLoader from './components/admin/ExamLoader.jsx';
import UserManagement from './components/admin/UserManagement.jsx';
import ExamAssignment from './components/admin/ExamAssignment.jsx';
import LLMConfiguration from './components/admin/LLMConfiguration.jsx';
import ResultsExporter from './components/admin/ResultsExporter.jsx';

function AppContent() {
  const { currentUser, currentRole, isLoggedIn, selectRole, login, logout, switchUser } = useAuth();
  const { users, currentView, navigate, addUser, isReady } = useApp();
  const { status: examStatus } = useExam();

  // Warn user before leaving if an exam is in progress
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (examStatus === SESSION_STATUS.IN_PROGRESS) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examStatus]);

  const handleSelectRole = useCallback((role) => {
    selectRole(role);
    navigate(VIEWS.USER_LOGIN);
  }, [selectRole, navigate]);

  const handleLogin = useCallback((user) => {
    login(user);
    navigate(currentRole === ROLES.ADMIN ? VIEWS.ADMIN_DASHBOARD : VIEWS.STUDENT_DASHBOARD);
  }, [login, navigate, currentRole]);

  const handleLogout = useCallback(() => {
    logout();
    navigate(VIEWS.ROLE_SELECT);
  }, [logout, navigate]);

  const handleSwitchUser = useCallback(() => {
    switchUser();
    navigate(VIEWS.USER_LOGIN);
  }, [switchUser, navigate]);

  const handleBack = useCallback(() => {
    logout();
    navigate(VIEWS.ROLE_SELECT);
  }, [logout, navigate]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Initializing..." />
      </div>
    );
  }

  // Auth screens (no shell)
  if (currentView === VIEWS.ROLE_SELECT || !currentRole) {
    return <RoleSelector onSelectRole={handleSelectRole} />;
  }

  if (currentView === VIEWS.USER_LOGIN || !isLoggedIn) {
    return (
      <UserLogin
        role={currentRole}
        users={users}
        onLogin={handleLogin}
        onBack={handleBack}
        onCreateUser={addUser}
      />
    );
  }

  // Main app with shell
  const renderView = () => {
    switch (currentView) {
      // Student views
      case VIEWS.STUDENT_DASHBOARD:
        return <StudentDashboard />;
      case VIEWS.EXAM_LIST:
        return <ExamList />;
      case VIEWS.EXAM_DETAIL:
        return <ExamDetail />;
      case VIEWS.EXAM_TAKING:
        return <ExamTaker />;
      case VIEWS.RESULTS_DASHBOARD:
        return <ResultsDashboard />;

      // Admin views
      case VIEWS.ADMIN_DASHBOARD:
        return <AdminDashboard />;
      case VIEWS.ADMIN_EXAMS:
        return <ExamLoader />;
      case VIEWS.ADMIN_USERS:
        return <UserManagement />;
      case VIEWS.ADMIN_ASSIGNMENTS:
        return <ExamAssignment />;
      case VIEWS.ADMIN_LLM_CONFIG:
        return <LLMConfiguration />;
      case VIEWS.ADMIN_RESULTS:
        return <ResultsExporter />;

      default:
        return currentRole === ROLES.ADMIN ? <AdminDashboard /> : <StudentDashboard />;
    }
  };

  return (
    <AppShell
      currentUser={currentUser}
      currentRole={currentRole}
      currentView={currentView}
      onNavigate={navigate}
      onLogout={handleLogout}
      onSwitchUser={handleSwitchUser}
    >
      <ErrorBoundary>{renderView()}</ErrorBoundary>
    </AppShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <ExamProvider>
              <OfflineIndicator />
              <AppContent />
            </ExamProvider>
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
