import React from 'react';

const HomePage = ({ setCurrentPage }) => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Simplify Your
            <span className="highlight">Digital Payments</span>
          </h1>
          <p className="hero-description">
            UnCryptic makes digital payments simple, secure, and accessible. Transfer money, pay bills, and manage your finances with confidence.
          </p>

          <div className="stats">
            <div className="stat">
              <h3>2M+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat">
              <h3>₹50Cr+</h3>
              <p>Transacted</p>
            </div>
            <div className="stat">
              <h3>99.9%</h3>
              <p>Uptime</p>
            </div>
          </div>

          <div className="features-badges">
            <div className="badge">
              <div className="badge-icon">🛡️</div>
              <span>Bank Grade Security</span>
            </div>
            <div className="badge">
              <div className="badge-icon">⚡</div>
              <span>Instant Transfers</span>
            </div>
          </div>
        </div>

        <div className="hero-widget">
          <div className="quick-transfer-widget">
            <div className="widget-header">
              <h3>Quick Transfer</h3>
              <div className="status-indicator"></div>
            </div>
            <div className="widget-content">
              <div className="balance-section">
                <p>Balance</p>
                <h2>₹1,25,680</h2>
              </div>
              <div className="send-section">
                <p>Send Money</p>
                <div className="amount-display">₹5,000</div>
              </div>
              <button className="transfer-btn" onClick={() => setCurrentPage('transfer-money')}>Transfer Now</button>
            </div>
            <div className="widget-floating-element"></div>
          </div>
        </div>
      </div>

      {/* Features Overview Section */}
      <div className="features-overview">
        <div className="features-container">
          <div className="features-header">
            <h1>
              Explore UnCryptic <span className="highlight">Features</span>
            </h1>
            <p>
              Discover all the powerful tools designed to make your digital payments seamless
            </p>
          </div>

          <div className="features-grid">
            <div
              className="feature-card clickable"
              onClick={() => setCurrentPage('transfer-money')}
            >
              <div className="feature-icon">💰</div>
              <h3>Pay/Request Money</h3>
              <p>
                Send payments or request money from anyone instantly
              </p>
            </div>
            <div
              className="feature-card clickable"
              onClick={() => setCurrentPage('credit-score')}
            >
              <div className="feature-icon">⭐</div>
              <h3>Credit Score</h3>
              <p>
                Monitor and improve your credit score with our interactive simulator
              </p>
            </div>
            <div
              className="feature-card clickable"
              onClick={() => setCurrentPage('transfer-money')}
            >
              <div className="feature-icon">📱</div>
              <h3>QR Scan & Pay</h3>
              <p>
                Scan QR codes to instantly fill payment details and send money
              </p>
            </div>
            <div
              className="feature-card clickable"
              onClick={() => setCurrentPage('transactions')}
            >
              <div className="feature-icon">📈</div>
              <h3>Transaction History</h3>
              <p>
                View your complete payment history and track all transactions
              </p>
            </div>
          </div>

          <div className="main-cta-section">
            <h2>Ready to Start Your Digital Payment Journey?</h2>
            <p>Join millions of users who trust UnCryptic for their daily financial transactions.</p>

            <div className="cta-features">
              <div
                className="cta-feature clickable"
                onClick={() => setCurrentPage('transfer-money')}
              >
                <div className="cta-feature-icon">📱</div>
                <span>QR Payments</span>
              </div>
              <div
                className="cta-feature clickable"
                onClick={() => setCurrentPage('credit-score')}
              >
                <div className="cta-feature-icon">⭐</div>
                <span>Credit Score</span>
              </div>
              <div className="cta-feature">
                <div className="cta-feature-icon">⚡</div>
                <span>Instant Transfer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;