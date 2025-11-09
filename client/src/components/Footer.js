import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">UC</div>
              <span className="footer-logo-text">UnCryptic</span>
            </div>
            <p className="footer-description">
              Simplifying digital payments for millions of users across India.
              Secure, fast, and reliable.
            </p>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#credit-score">Credit Score</a></li>
              <li><a href="#offline-payment">QR Payment</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Services</h3>
            <ul className="footer-links">
              <li><a href="#money-transfer">Money Transfer</a></li>
              <li><a href="#bill-payments">Bill Payments</a></li>
              <li><a href="#qr-payments">QR Payments</a></li>
              <li><a href="#transaction-history">Transaction History</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Support</h3>
            <ul className="footer-links">
              <li><a href="#help-center">Help Center</a></li>
              <li><a href="#contact-us">Contact Us</a></li>
              <li><a href="#privacy-policy">Privacy Policy</a></li>
              <li><a href="#terms-of-service">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 UnCryptic. All rights reserved. Made with ❤️ for digital India.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;