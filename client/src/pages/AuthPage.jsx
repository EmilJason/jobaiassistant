import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === '/auth/register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/register' : '/api/login';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || 'Authentication failed');
      return;
    }

    localStorage.setItem('jobai_token', data.token || email);
    setMessage(isRegister ? 'Account created successfully' : 'Logged in successfully');
    navigate('/dashboard');
  };

  const socialLogin = async (provider) => {
    const response = await fetch(`/api/auth/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, providerId: `${provider}-${email || 'demo'}` })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || 'Social login failed');
      return;
    }

    localStorage.setItem('jobai_token', data.token || `${provider}-${email || 'demo'}`);
    navigate('/dashboard');
  };

  return (
    <div className="page auth-page">
      <div className="panel auth-card">
        <h1>{isRegister ? 'Create account' : 'Welcome back'}</h1>
        <p className="page-intro">
          {isRegister
            ? 'Create a secure account and start organizing your job search.'
            : 'Sign in to continue to your dashboard and tools.'}
        </p>

        <form onSubmit={submit}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
          <button type="submit">{isRegister ? 'Create account' : 'Login'}</button>
        </form>

        <div className="social-buttons">
          <button type="button" className="social-btn google" onClick={() => socialLogin('google')}>
            <span className="social-icon google-icon" aria-hidden="true">G</span>Continue with Google
          </button>
          <button type="button" className="social-btn facebook" onClick={() => socialLogin('facebook')}>
            <span className="social-icon facebook-icon" aria-hidden="true">f</span>Continue with Facebook
          </button>
        </div>

        {!isRegister && (
          <p className="auth-link">
            Need an account? <Link to="/auth/register">Register</Link>
          </p>
        )}

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default AuthPage;
