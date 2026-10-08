import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import NewProjectPage from './pages/NewProjectPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'new-project'
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('fpt_user');
    const token = localStorage.getItem('fpt_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('fpt_user');
        localStorage.removeItem('fpt_token');
      }
    }
    setCheckingAuth(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('fpt_token');
    localStorage.removeItem('fpt_user');
    setUser(null);
    setCurrentView('dashboard');
  };

  if (checkingAuth) {
    return (
      <div className="auth-page-container">
        <p style={{ color: 'var(--text-muted)' }}>Initializing...</p>
      </div>
    );
  }

  // Page 1: Auth Page (when not signed in)
  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setCurrentView('dashboard')}>
          <div className="brand-icon">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="brand-title">Freelance Project Tracker</span>
          <span className="brand-badge">Minimoth Auth</span>
        </div>

        <div className="nav-actions">
          <div className="user-pill">
            <span>👤</span>
            <strong>{user.name || 'Freelancer'}</strong>
          </div>

          {currentView === 'dashboard' ? (
            <button
              id="nav-btn-create"
              className="btn btn-primary btn-sm"
              onClick={() => setCurrentView('new-project')}
            >
              + New Project
            </button>
          ) : (
            <button
              id="nav-btn-dashboard"
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </button>
          )}

          <button
            id="nav-btn-logout"
            className="btn btn-outline btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Pages 2 & 3 */}
      {currentView === 'dashboard' ? (
        <DashboardPage
          user={user}
          onNavigateNewProject={() => setCurrentView('new-project')}
        />
      ) : (
        <NewProjectPage
          onBackToDashboard={() => setCurrentView('dashboard')}
        />
      )}
    </div>
  );
}
