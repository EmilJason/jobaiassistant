import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import AtsCheckerPage from './pages/AtsCheckerPage';
import CoverLetterPage from './pages/CoverLetterPage';
import JobTrackerPage from './pages/JobTrackerPage';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('jobai_token');
  return token ? children : <Navigate to="/auth" replace />;
}

function App() {
  const token = localStorage.getItem('jobai_token');

  return (
    <BrowserRouter>
      <div className="app-shell">
        {token && (
          <nav className="top-nav">
            <Link to="/dashboard"><span className="nav-icon">▣</span>Dashboard</Link>
            <Link to="/resume-analyzer"><span className="nav-icon">✎</span>Resume Analyzer</Link>
            <Link to="/ats-checker"><span className="nav-icon">✓</span>ATS Checker</Link>
            <Link to="/cover-letter"><span className="nav-icon">✉</span>Cover Letter</Link>
            <Link to="/job-tracker"><span className="nav-icon">⧉</span>Job Tracker</Link>
            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem('jobai_token');
                window.location.href = '/';
              }}
            >
              <span className="nav-icon">↺</span>Logout
            </button>
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
