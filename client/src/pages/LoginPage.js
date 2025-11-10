import React, { useState } from 'react';
import api, { loginUser } from '../services/api';

const LoginPage = ({ setCurrentPage, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('=== LOGIN DEBUG START ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('API URL:', 'http://localhost:5001/api/auth/login');
    console.log('Form submitted at:', new Date().toISOString());

    try {
      console.log('About to call loginUser...');
      const response = await loginUser(email, password);
      console.log('LoginUser response received:', response);

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
      console.log('Calling onLogin with user data:', response.data.user);
      onLogin(response.data.user);
    } catch (error) {
      console.error('=== LOGIN ERROR START ===');
      console.error('Error type:', typeof error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      console.error('Error response exists:', !!error.response);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
      console.error('=== LOGIN ERROR END ===');

      if (error.response?.data?.code === 'USER_NOT_FOUND') {
        const goToSignup = window.confirm('No account found with this email. Would you like to create a new account?');
        if (goToSignup) {
          setCurrentPage('signup');
          return;
        }
      } else if (error.response?.data?.code === 'INVALID_PASSWORD') {
        setError('The password you entered is incorrect. Please try again.');
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
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="text"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {password && password.length < 6 && (
                <div className="password-hint">
                  <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>
                    💡 For better security, use passwords with 8+ characters, including uppercase, lowercase, numbers, and special characters
                  </span>
                </div>
              )}
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

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-login">
            <button className="social-btn google" onClick={() => onLogin('google@example.com', 'social')}>
              <span>G</span>
              Google
            </button>
            <button className="social-btn otp">
              <span>📱</span>
              OTP
            </button>
          </div>

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

          <div className="security-note">
            <span>🔒</span>
            <span>Your information is secured with bank-grade encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;