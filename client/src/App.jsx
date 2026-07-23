import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import AtsCheckerPage from './pages/AtsCheckerPage';
import CoverLetterPage from './pages/CoverLetterPage';
import JobTrackerPage from './pages/JobTrackerPage';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';

function useAuthToken() {
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem('jobai_token');
  });

  useEffect(() => {
    const syncToken = () => {
      setToken(window.localStorage.getItem('jobai_token'));
    };

    syncToken();
    window.addEventListener('auth:changed', syncToken);
    window.addEventListener('storage', syncToken);

    return () => {
      window.removeEventListener('auth:changed', syncToken);
      window.removeEventListener('storage', syncToken);
    };
  }, []);

  return token;
}

function ProtectedRoute({ children }) {
  const token = useAuthToken();
  return token ? children : <Navigate to="/auth" replace />;
}

function App() {
  const token = useAuthToken();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('jobai_token');
    window.dispatchEvent(new Event('auth:changed'));
    window.location.href = '/';
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        {token && (
          <nav className="top-nav">
            <div className="top-nav-shell">
              <Link to="/dashboard" className="brand-pill" onClick={() => setMenuOpen(false)}>
                <span className="nav-icon">✦</span>JobAI Assistant
              </Link>

              <div className="nav-actions">
                <div className="dropdown">
                  <button className="dropdown-toggle" onClick={() => setMenuOpen((prev) => !prev)}>
                    <span className="nav-icon">☰</span>Menu
                  </button>
                  <div className={`dropdown-menu ${menuOpen ? 'show' : ''}`}>
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)}><span className="nav-icon">▣</span>Dashboard</Link>
                    <Link to="/resume-analyzer" onClick={() => setMenuOpen(false)}><span className="nav-icon">✎</span>Resume Analyzer</Link>
                    <Link to="/ats-checker" onClick={() => setMenuOpen(false)}><span className="nav-icon">✓</span>ATS Checker</Link>
                    <Link to="/cover-letter" onClick={() => setMenuOpen(false)}><span className="nav-icon">✉</span>Cover Letter</Link>
                    <Link to="/job-tracker" onClick={() => setMenuOpen(false)}><span className="nav-icon">⧉</span>Job Tracker</Link>
                  </div>
                </div>

                <button className="logout-btn" onClick={handleLogout}>
                  <span className="nav-icon">↺</span>Logout
                </button>
              </div>
            </div>
          </nav>
        )}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/login" element={<AuthPage />} />
          <Route path="/auth/register" element={<AuthPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/resume-analyzer" element={<ProtectedRoute><ResumeAnalyzerPage /></ProtectedRoute>} />
          <Route path="/ats-checker" element={<ProtectedRoute><AtsCheckerPage /></ProtectedRoute>} />
          <Route path="/cover-letter" element={<ProtectedRoute><CoverLetterPage /></ProtectedRoute>} />
          <Route path="/job-tracker" element={<ProtectedRoute><JobTrackerPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
