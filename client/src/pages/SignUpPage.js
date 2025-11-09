import React, { useState } from 'react';
import { registerUser } from '../services/api';

const SignUpPage = ({ setCurrentPage, onSignup }) => {
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: '',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  const validatePasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    let message = '';
    let color = '';

    if (password.length === 0) {
      message = 'Enter a password';
      color = '#666';
    } else if (score < 3) {
      message = 'Weak password';
      color = '#ff4757';
    } else if (score < 4) {
      message = 'Medium password';
      color = '#ffa502';
    } else {
      message = 'Strong password';
      color = '#2ed573';
    }

    return { score, message, requirements, color };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate password strength in real-time
    if (name === 'password') {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (passwordStrength.score < 2) {
      setError('Password is too weak. Please include uppercase, lowercase, numbers, or special characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser(
        formData.fullName,
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.phone
      );

      console.log('Registration successful:', response.data);

      // The registerUser function already handles token and user data storage
      if (response.data.user) {
        onSignup(response.data.user);
      } else {
        onSignup(response.data);
      }
    } catch (error) {
      if (error.response?.data?.code === 'USER_EXISTS') {
        const goToLogin = window.confirm(error.response.data.message + ' Would you like to go to the login page?');
        if (goToLogin) {
          setCurrentPage('login');
        }
      } else {
        setError(error.response?.data?.message || 'Failed to register. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      ></div>
                    </div>
                    <span
                      className="strength-text"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.message}
                    </span>
                  </div>
                )}

                {/* Password Requirements */}
                {formData.password && (
                  <div className="password-requirements">
                    <p>Password must include:</p>
                    <ul>
                      <li className={passwordStrength.requirements.length ? 'met' : 'unmet'}>
                        ✓ At least 8 characters
                      </li>
                      <li className={passwordStrength.requirements.uppercase ? 'met' : 'unmet'}>
                        ✓ One uppercase letter (A-Z)
                      </li>
                      <li className={passwordStrength.requirements.lowercase ? 'met' : 'unmet'}>
                        ✓ One lowercase letter (a-z)
                      </li>
                      <li className={passwordStrength.requirements.number ? 'met' : 'unmet'}>
                        ✓ One number (0-9)
                      </li>
                      <li className={passwordStrength.requirements.special ? 'met' : 'unmet'}>
                        ✓ One special character (!@#$%^&*)
                      </li>
                    </ul>
                  </div>
                )}
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

            {error && (
              <div className="error-message" style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '0.875rem'
              }}>
                <strong>⚠️ {error}</strong>
                {error.includes('weak') && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    💡 Try using a mix of uppercase, lowercase, numbers, and special characters like !@#$%^&*
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="signup-btn"
              disabled={!agreeToTerms || loading || passwordStrength.score < 2}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="divider">
              <span>Or sign up with</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-btn google">
                <span>G</span>
                Google
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