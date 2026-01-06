import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LabUsage from './pages/LabUsage';
import type { User } from './types';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
    // In a real app, user data comes from the auth response
    setUser({
      id: '1',
      email: 'student@kmitl.ac.th',
      name: 'Student User',
      role: 'student'
    });
    navigate('/');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  return (
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
