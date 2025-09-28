import React, { useState } from 'react';

const OfflinePaymentPage = () => {
  const [paymentAmount, setPaymentAmount] = useState('500');

  return (
    <div className="qr-payments-page">
      <div className="qr-header">
        <h1>QR Code<span className="highlight">Payments</span></h1>
        <p>Generate QR codes for instant payments. Works both online and offline - your customers can scan and pay anytime.</p>
      </div>

      <div className="qr-generator">
        <h2>Generate Payment QR Code</h2>
        <p>Create a QR code for offline payment collection</p>
        
        <div className="payment-form">
          <label>Payment Amount</label>
          <div className="amount-input">
            <span>₹</span>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
        </div>

        <div className="qr-display">
          <div className="qr-code">
            <div className="qr-pattern">
              <div className="qr-squares">
                {[...Array(64)].map((_, i) => (
                  <div key={i} className={`qr-square ${Math.random() > 0.5 ? 'filled' : ''}`}></div>
                ))}
              </div>
            </div>
            <p>QR Code will appear here</p>
          </div>
          <p className="qr-amount">Amount: ₹{paymentAmount}</p>
        </div>

        <div className="qr-actions">
          <button className="btn-primary">Generate</button>
          <button className="btn-secondary">Copy</button>
          <button className="btn-secondary">Download</button>
          <button className="btn-secondary">Share</button>
        </div>

        <div className="how-it-works">
          <h3>How it works:</h3>
          <ol>
            <li>Enter the payment amount</li>
            <li>Generate QR code</li>
            <li>Show QR code to customer</li>
            <li>Customer scans with any UPI app</li>
            <li>Payment completed instantly</li>
          </ol>
        </div>
      </div>

      <div className="qr-features">
        <div className="feature-section online">
          <h3>Works Online & Offline</h3>
          <div className="feature-item">
            <h4>Online Mode</h4>
            <p>Real-time payment verification and instant notifications</p>
          </div>
          <div className="feature-item">
            <h4>Offline Mode</h4>
            <p>QR codes work without internet - payments sync when connected</p>
          </div>
        </div>

        <div className="key-benefits">
          <h3>Key Benefits</h3>
          <ul>
            <li>Universal compatibility with all UPI apps</li>
            <li>No internet required for payment scanning</li>
            <li>Instant payment confirmation</li>
            <li>Secure encrypted payment processing</li>
            <li>Automatic transaction recording</li>
            <li>Print or display on any device</li>
          </ul>
        </div>

        <div className="qr-stats">
          <h3>QR Payment Stats</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>98%</h4>
              <p>Success Rate</p>
            </div>
            <div className="stat-card">
              <h4>&lt;3s</h4>
              <p>Avg Scan Time</p>
            </div>
            <div className="stat-card">
              <h4>24/7</h4>
              <p>Availability</p>
            </div>
            <div className="stat-card">
              <h4>100%</h4>
              <p>Secure</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h2>Start Accepting QR Payments Today</h2>
          <p>Join thousands of merchants who trust UnCryptic's QR payment system for their business transactions.</p>
          <div className="cta-buttons">
            <button className="btn-primary">Get Started Free</button>
            <button className="btn-secondary">View Documentation</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflinePaymentPage;