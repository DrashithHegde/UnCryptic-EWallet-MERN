import React, { useState } from 'react';

const LoginPage = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon">₿</div>
            <span className="logo-text">UnCryptic</span>
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <div className="login-form">
          <h2>Sign In</h2>
          <p>Enter your credentials to access your UnCryptic account</p>

          <div className="form-group">
            <label>Email or Phone Number</label>
            <input
              type="text"
              placeholder="Enter your email or phone"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
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

          <button className="login-btn">Sign In</button>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-login">
            <button className="social-btn google">
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