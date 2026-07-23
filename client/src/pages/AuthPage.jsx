import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser, registerUser, socialLogin as socialLoginService } from '../services/appClient';

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === '/auth/register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const result = isRegister
      ? await registerUser(email, password)
      : await loginUser(email, password);

    if (!result.ok) {
      setMessage(result.data?.message || 'Authentication failed');
      return;
    }

    setMessage(isRegister ? 'Account created successfully' : 'Logged in successfully');
    navigate('/dashboard');
  };

  const socialLogin = async (provider) => {
    const result = await socialLoginService(provider, email);
    if (!result.ok) {
      setMessage(result.data?.message || 'Social login failed');
      return;
    }

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
