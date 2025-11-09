import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const OfflinePaymentPage = () => {
  const [paymentAmount, setPaymentAmount] = useState('500');
  const [merchantName, setMerchantName] = useState('UnCryptic Wallet');
  const [description, setDescription] = useState('Payment');
  const [qrGenerated, setQrGenerated] = useState(false);

  // Generate UPI payment string
  const generateUPIString = () => {
    const upiId = 'uncryptic@upi'; // Replace with actual UPI ID
    const amount = paymentAmount || '0';
    const name = merchantName || 'UnCryptic Wallet';
    const note = description || 'Payment';

    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  const handleGenerateQR = () => {
    if (paymentAmount && paymentAmount > 0) {
      setQrGenerated(true);
    } else {
      alert('Please enter a valid amount');
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qr-canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const link = document.createElement('a');
      link.download = `payment-qr-${paymentAmount}.png`;
      link.href = url;
      link.click();
    }
  };

  const handleCopyUPI = () => {
    const upiString = generateUPIString();
    navigator.clipboard.writeText(upiString).then(() => {
      alert('UPI payment link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy. Please try again.');
    });
  };

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
          <div className="form-group">
            <label>Merchant Name</label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Enter merchant name"
            />
          </div>

          <div className="form-group">
            <label>Payment Amount</label>
            <div className="amount-input">
              <span>₹</span>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Payment description"
            />
          </div>
        </div>

        <div className="qr-display">
          <div className="qr-code">
            {qrGenerated ? (
              <QRCodeCanvas
                id="qr-canvas"
                value={generateUPIString()}
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            ) : (
              <div className="qr-placeholder">
                <div className="placeholder-icon">📱</div>
                <p>Click Generate to create QR Code</p>
              </div>
            )}
          </div>
          {qrGenerated && (
            <div className="qr-details">
              <p className="qr-merchant"><strong>Merchant:</strong> {merchantName}</p>
              <p className="qr-amount"><strong>Amount:</strong> ₹{paymentAmount}</p>
              <p className="qr-desc"><strong>Description:</strong> {description}</p>
              <p className="qr-upi"><strong>UPI ID:</strong> uncryptic@upi</p>
            </div>
          )}
        </div>

        <div className="qr-actions">
          <button className="btn-primary" onClick={handleGenerateQR}>
            {qrGenerated ? 'Regenerate' : 'Generate QR'}
          </button>
          {qrGenerated && (
            <>
              <button className="btn-secondary" onClick={handleCopyUPI}>
                Copy UPI Link
              </button>
              <button className="btn-secondary" onClick={handleDownloadQR}>
                Download QR
              </button>
              <button className="btn-secondary" onClick={() => setQrGenerated(false)}>
                Reset
              </button>
            </>
          )}
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
      </div>
    </div>
  );
};

export default OfflinePaymentPage;