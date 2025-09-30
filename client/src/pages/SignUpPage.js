import React, { useState } from 'react';

const SignUpPage = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form validation logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <div className="logo">
            <div className="logo-icon">UC</div>
            <span className="logo-text">UnCryptic</span>
          </div>
          <h1>Create Your Account</h1>
          <p>Join millions of users who trust UnCryptic for secure digital payments</p>
        </div>

        <div className="signup-form">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                />
                I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="signup-btn" disabled={!agreeToTerms}>
              Create Account
            </button>

            <div className="divider">
              <span>Or sign up with</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-btn google">
                <span>G</span>
                Google
              </button>
              <button type="button" className="social-btn facebook">
                <span>f</span>
                Facebook
              </button>
            </div>

            <div className="login-link">
              <span>Already have an account? </span>
              <button 
                type="button" 
                className="link-btn"
                onClick={() => setCurrentPage('login')}
              >
                Sign in here
              </button>
            </div>
          </form>

          <div className="security-features">
            <h3>Why Choose UnCryptic?</h3>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Bank-grade security encryption</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Instant money transfers</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💳</span>
                <span>Multiple payment options</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📱</span>
                <span>Mobile-first experience</span>
              </div>
            </div>
          </div>

          <div className="security-note">
            <span>🛡️</span>
            <span>Your personal information is protected with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;