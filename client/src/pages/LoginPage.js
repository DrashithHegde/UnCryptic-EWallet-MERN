import React, { useState } from 'react';
import api, { loginUser } from '../services/api';

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};

const LoginPage = ({ setCurrentPage, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(sanitizeInput(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser(email, password);

      // Ensure user has default balance
      if (!response.data.user.balance || response.data.user.balance === 0) {
        try {
          await api.post('/api/admin/update-default-balance');
          // Refresh user data after balance update
          const updatedResponse = await loginUser(email, password);
          response.data = updatedResponse.data;
        } catch (error) {
          console.error('Failed to update balance:', error);
        }
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (error) {
      if (error.response?.data?.code === 'USER_NOT_FOUND') {
        setError('User not found. Please check your email or sign up.');
      } else if (error.response?.data?.code === 'INVALID_PASSWORD') {
        setError('Invalid password. Please try again.');
      } else if (error.response?.data?.code === 'PASSWORD_EXPIRED') {
        setError('Your password has expired. Please reset your password to continue.');
      } else {
        setError(error.response?.data?.message || 'Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon">UC</div>
            <span className="logo-text">UnCryptic</span>
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <div className="login-form">
          <h2>Sign In</h2>
          <p>Enter your credentials to access your UnCryptic account</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-message" style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>{error}</div>}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="text"
                placeholder="Enter your email address"
                value={email}
                onChange={handleEmailChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-btn">Sign In</button>
          </form>

          <div className="signup-link">
            <span>Don't have an account? </span>
            <button
              type="button"
              className="link-btn"
              onClick={() => setCurrentPage('signup')}
            >
              Sign up for free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;