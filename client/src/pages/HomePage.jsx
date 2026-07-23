import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="page landing-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="brand-badge">
            <img src="/jobai-logo.svg" alt="JobAI Assistant logo" />
            <span>JobAI Assistant</span>
          </div>
          <p className="eyebrow">AI-powered career assistant</p>
          <h1>Apply smarter, get hired faster.</h1>
          <p className="subtitle">
            Review your resume, score your match to jobs, generate cover letters, and track every application from one elegant workspace.
          </p>
          <div className="hero-actions">
            <Link to="/auth/login" className="primary-btn">Login</Link>
            <Link to="/auth/register" className="secondary-btn">Create account</Link>
          </div>
        </div>

        <div className="hero-card">
          <h2>Why applicants love it</h2>
          <ul>
            <li>Resume insights that feel actionable</li>
            <li>ATS scoring for real job matches</li>
            <li>Tailored cover letters in seconds</li>
            <li>A dashboard that keeps your search organized</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
