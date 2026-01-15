import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LabUsage from './pages/LabUsage';
import type { User } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { getCurrentUser, logout } from './services/auth.service';
import { useIdleTimer } from './hooks/useIdleTimer';
import { SessionExpiredModal } from './components/SessionExpiredModal';

// Timeout duration in milliseconds (e.g., 14 minutes idle, then 1 minute warning)
const IDLE_TIMEOUT = 14 * 60 * 1000;  // 14 minutes before warning
const WARNING_DURATION = 60 * 1000;    // 1 minute countdown

function AppContent() {
  // Lazy initialization to check storage immediately
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const user = getCurrentUser();
    return !!token && !!user;
  });
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const navigate = useNavigate();

  const handleLogin = () => {
    // Reload state from storage after successful login
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const { showWarning, countdown, stayActive } = useIdleTimer({
    timeout: IDLE_TIMEOUT,
    warningDuration: WARNING_DURATION,
    onIdle: handleLogout,
    active: isAuthenticated
  });

  return (
    <>
      <SessionExpiredModal 
        isOpen={showWarning} 
        onClose={stayActive} 
        countdown={countdown} 
      />
      <Routes>
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Dashboard user={user!} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/lab/:id" 
          element={
            isAuthenticated ? (
              <LabUsage />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

