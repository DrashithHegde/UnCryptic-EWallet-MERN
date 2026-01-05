import React, { useState } from 'react';
import { registerUser } from '../services/api';

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  return input.replace(/[<>]/g, '');
};

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
    } else if (score < 5) {
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

    // Special handling for phone number - only allow digits and limit to 10 characters
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, ''); // Remove all non-digit characters
      if (numericValue.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
      return;
    }

    // Sanitize email and name fields
    if (name === 'email' || name === 'fullName') {
      let sanitized = sanitizeInput(value);
      // Remove numbers and special chars from full name (keep only letters and spaces)
      if (name === 'fullName') {
        sanitized = sanitized.replace(/[^a-zA-Z\s]/g, '');
      }
      setFormData(prev => ({
        ...prev,
        [name]: sanitized
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    setError('');

    // Validate password strength in real-time
    if (name === 'password') {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const setErrorWithTimeout = (message) => {
    setError(message);
    setTimeout(() => {
      setError('');
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate full name
    if (!formData.fullName || formData.fullName.trim().length === 0) {
      setError('Full name is required');
      return;
    }

    if (formData.fullName.length < 3) {
      setError('Full name must be at least 3 characters');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate phone number
    if (!formData.phone || formData.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorWithTimeout('Passwords do not match');
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
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter 10-digit phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    maxLength="10"
                    pattern="\d{10}"
                    title="Please enter exactly 10 digits"
                    required
                  />
                </div>
                {formData.phone && formData.phone.length < 10 && (
                  <small style={{ color: '#ff4757', fontSize: '12px' }}>
                    Phone number must be 10 digits ({formData.phone.length}/10)
                  </small>
                )}
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
                <strong>{error}</strong>
              </div>
            )}

            <button
              type="submit"
              className="signup-btn"
              disabled={!agreeToTerms || loading || passwordStrength.score < 5}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

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
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;