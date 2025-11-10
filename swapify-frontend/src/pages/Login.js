import React, { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin, switchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const res = await api('/auth/login', 'POST', { email, password });
      if (res.token) {
        onLogin(res.token);
      } else {
        let errorMsg = res.msg || 'Invalid credentials';
        if (email === 'support@swapify.com') {
          errorMsg = 'Please ensure you are using the correct developer credentials';
        }
        setError(errorMsg);
      }
    } catch (err) {
      let errorMsg = 'Something went wrong. Please try again.';
      if (err.response?.status === 400) {
        errorMsg = 'Invalid email or password';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Welcome to Swapify</h1>
        <p>Sign in to continue to your account</p>
        {email === 'supports@swapify.com' && (
          <div className="developer-notice">
            <i className="fas fa-info-circle"></i>
            Developer Account Login
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <i className="fas fa-envelope"></i>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="input-group">
          <i className="fas fa-lock"></i>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="auth-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Signing in...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i>
              Sign in
            </>
          )}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account?
        <span className="link" onClick={switchToRegister}>
          Create account
        </span>
      </div>
    </div>
  );
}
