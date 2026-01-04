import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { createTransaction, createMoneyRequest } from '../services/api';

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};

const TransferMoneyPage = ({ initialTab = 'pay', transferData = {}, setTransferData, setUserData, userData }) => {
  const currentUserData = userData || JSON.parse(localStorage.getItem('userData') || '{}');
  const qrPayeeName = currentUserData.name || 'User';
  const qrPayeeEmail = currentUserData.email || 'user@uncryptic.com';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState(transferData.email || '');
  const [amount, setAmount] = useState(transferData.amount || '');
  const [note, setNote] = useState('');
  const [qrAmount, setQrAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [notificationPopup, setNotificationPopup] = useState({ show: false, text: '', type: '' });
  const [qrSubTab, setQrSubTab] = useState('transfer');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (activeTab === 'pay') {
        const response = await createTransaction(email, parseFloat(amount), 'payment', note);
        const successMsg = 'Payment successful!';
        setMessage(successMsg);
        setNotificationPopup({ show: true, text: successMsg, type: 'success' });
        if (setUserData) {
          setUserData(prev => ({ ...prev, balance: response.newBalance }));
        }
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.balance = response.newBalance;
        localStorage.setItem('userData', JSON.stringify(userData));
      } else if (activeTab === 'request') {
        await createMoneyRequest(email, parseFloat(amount), note);
        const successMsg = 'Request sent!';
        setMessage(successMsg);
        setNotificationPopup({ show: true, text: successMsg, type: 'success' });
      }
      setEmail('');
      setAmount('');
      setNote('');
      setTransferData({});

      // Auto-hide popup after 2 seconds
      setTimeout(() => {
        setNotificationPopup({ show: false, text: '', type: '' });
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Transaction failed';
      setMessage(errorMsg);
      setNotificationPopup({ show: true, text: errorMsg, type: 'error' });

      // Auto-hide error popup after 3 seconds
      setTimeout(() => {
        setNotificationPopup({ show: false, text: '', type: '' });
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleQrAmountChange = (value) => {
    const numeric = Number(value);
    if (!value || Number.isNaN(numeric) || numeric <= 0) {
      setQrAmount('');
      return;
    }
    if (numeric > 100000) {
      return;
    }
    setQrAmount(value);
  };

  const handleAmountChange = (value) => {
    const numeric = Number(value);
    if (!value || Number.isNaN(numeric) || numeric <= 0) {
      setAmount('');
      return;
    }
    if (numeric > 100000) {
      return;
    }
    setAmount(value);
  };

  const detectQRCode = (imageData) => {
    const data = imageData.data;
    let darkCount = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;
      if (brightness < 127) {
        darkCount++;
      }
    }
    const darkPercentage = (darkCount / (data.length / 4)) * 100;
    return darkPercentage > 20 && darkPercentage < 80;
  };

  const decodeQRCode = (imageData) => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      return code?.data || null;
    } catch (error) {
      return null;
    }
  };

  const parseUPIData = (upiString) => {
    try {
      let email = '';
      let amount = '';

      if (upiString && upiString.startsWith('upi://')) {
        try {
          const params = new URLSearchParams(upiString.replace('upi://pay?', ''));
          email = params.get('pa')?.replace('@upi', '') || '';
          amount = params.get('am') || '';
        } catch (e) {
          // Silent fail
        }
      }

      return { email, amount };
    } catch (error) {
      return { email: '', amount: '' };
    }
  };

  const startScanner = async () => {
    try {
      setScanMessage('Starting camera...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setIsScanning(true);

      // Wait for state update before accessing ref
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(() => { });
          };

          videoRef.current.play().catch(() => { });
        }

        setScanMessage('Scanning... Point camera at QR code');
        setTimeout(() => {
          scanQRCode();
        }, 500);
      }, 100);
    } catch (error) {
      setScanMessage(`Error: ${error.message}`);
      setIsScanning(false);
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let detectionCount = 0;
    const requiredDetections = 3;
    let frameCount = 0;

    scanIntervalRef.current = setInterval(() => {
      try {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          frameCount++;

          // First try jsQR directly
          const qrData = decodeQRCode(imageData);
          if (qrData) {
            detectionCount++;

            if (detectionCount >= requiredDetections) {
              const { email: scannedEmail, amount: scannedAmount } = parseUPIData(qrData);
              if (scannedEmail) {
                setEmail(scannedEmail);
                if (scannedAmount && scannedAmount.trim() !== '') {
                  setAmount(scannedAmount);
                }
                setQrSubTab('transfer');
                setScanMessage('✓ QR Code detected!');
              }
            }
          } else {
            // If jsQR fails, try pixel detection as backup
            if (detectQRCode(imageData)) {
              detectionCount++;
            } else {
              detectionCount = 0;
            }
          }
        }
      } catch (error) {
        // Silent error handling
      }
    }, 100);

    setTimeout(() => {
      if (isScanning && scanIntervalRef.current) {
        setScanMessage('Scan timeout. Please try again.');
        stopScanner();
      }
    }, 30000);
  };

  const stopScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
    setScanMessage('');
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    // Keep form in sync with transferData from parent
    setEmail(transferData.email || '');
    setAmount(transferData.amount || '');
  }, [transferData.email, transferData.amount]);

  useEffect(() => {
    // Stop scanner when switching tabs or sub-tabs
    if (isScanning) {
      stopScanner();
    }
  }, [activeTab, qrSubTab]);

  return (
    <div className="transfer-money-page">
      {notificationPopup.show && (
        <div className={`notification-popup ${notificationPopup.type}`}>
          {notificationPopup.type === 'success' ? '✓' : '✕'} {notificationPopup.text}
        </div>
      )}

      <div className="transfer-container">
        <div className="transfer-header">
          <h1>Transfer <span className="highlight">Money</span></h1>
          <p>Send payments or request money with ease</p>
        </div>

        <div className="transfer-card">
          <div className="card-header">
            <h2>Send or Request Money</h2>
            <p>Pay someone, request money, or pay with QR code</p>
          </div>

          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'pay' ? 'active' : ''}`}
              onClick={() => setActiveTab('pay')}
            >
              Pay
            </button>
            <button
              className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
              onClick={() => setActiveTab('request')}
            >
              Request
            </button>
          </div>

          {activeTab === 'pay' && (
            <div className="qr-subtabs">
              <button
                className={`qr-subtab-btn ${qrSubTab === 'transfer' ? 'active' : ''}`}
                onClick={() => setQrSubTab('transfer')}
              >
                Transfer
              </button>
              <button
                className={`qr-subtab-btn ${qrSubTab === 'code' ? 'active' : ''}`}
                onClick={() => setQrSubTab('code')}
              >
                QR Code
              </button>
              <button
                className={`qr-subtab-btn ${qrSubTab === 'scan' ? 'active' : ''}`}
                onClick={() => setQrSubTab('scan')}
              >
                QR Scan
              </button>
            </div>
          )}

          {activeTab === 'qr' ? (
            <div className="qr-card">
              <div className="qr-generator">
                <h3>Generate QR Code for Payment</h3>
                <p>Enter the amount to generate a QR code for payment</p>

                <div className="form-field">
                  <label>Amount <span className="required">*</span></label>
                  <div className="amount-input-wrapper">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter amount"
                      value={qrAmount}
                      onChange={(e) => handleQrAmountChange(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>
                </div>

                {qrAmount && (
                  <div className="qr-display">
                    <img
                      className="qr-code"
                      alt={`QR code for ₹${qrAmount}`}
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
                        `upi://pay?pa=${qrPayeeEmail}&pn=${qrPayeeName}&am=${qrAmount}&tr=QR${Date.now()}`
                      )}`}
                    />
                    <div className="qr-info">
                      <p className="qr-amount">Payment Amount: <strong>₹{qrAmount}</strong></p>
                      <p className="qr-description">Pay to {qrPayeeName} ({qrPayeeEmail})</p>
                      <p className="qr-description">Ask the payer to scan this QR code to complete the payment</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'pay' && qrSubTab === 'code' ? (
            <div className="qr-code-section">
              <div className="qr-generator">
                <h3>Generate QR Code for Payment</h3>
                <p>Enter the amount to generate a QR code for payment</p>

                <div className="form-field">
                  <label>Amount <span className="required">*</span></label>
                  <div className="amount-input-wrapper">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter amount"
                      value={qrAmount}
                      onChange={(e) => handleQrAmountChange(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                  </div>
                </div>

                {qrAmount && (
                  <div className="qr-display">
                    <img
                      className="qr-code"
                      alt={`QR code for ₹${qrAmount}`}
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
                        `upi://pay?pa=${qrPayeeEmail}&pn=${qrPayeeName}&am=${qrAmount}&tr=QR${Date.now()}`
                      )}`}
                    />
                    <div className="qr-info">
                      <p className="qr-amount">Payment Amount: <strong>₹{qrAmount}</strong></p>
                      <p className="qr-description">Pay to {qrPayeeName} ({qrPayeeEmail})</p>
                      <p className="qr-description">Ask the payer to scan this QR code to complete the payment</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'pay' && qrSubTab === 'scan' ? (
            <div className="qr-scanner-section">
              <div className="scanner-controls">
                {!isScanning ? (
                  <button
                    type="button"
                    className="start-scan-btn"
                    onClick={startScanner}
                  >
                    Start Scanner
                  </button>
                ) : (
                  <button
                    type="button"
                    className="stop-scan-btn"
                    onClick={stopScanner}
                  >
                    Stop Scanner
                  </button>
                )}
              </div>

              {isScanning && (
                <div className="scanner-container">
                  <video
                    ref={videoRef}
                    className="scanner-video"
                    autoPlay={true}
                    playsInline={true}
                    muted={true}
                    style={{ display: 'block' }}
                  />
                  <div className="scanner-frame">
                    <div className="scanner-corner scanner-corner-top-left" />
                    <div className="scanner-corner scanner-corner-top-right" />
                    <div className="scanner-corner scanner-corner-bottom-left" />
                    <div className="scanner-corner scanner-corner-bottom-right" />
                  </div>
                  <div className="scanner-instruction">
                    <p>Position QR code in the frame</p>
                  </div>
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
              )}

              {scanMessage && (
                <p style={{ textAlign: 'center', marginTop: '16px', color: '#8b5cf6' }}>
                  {scanMessage}
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="transfer-form">
              {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}

              <div className="form-field">
                <label>Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  placeholder="Enter recipient email"
                  value={email}
                  onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                  required
                />
              </div>

              <div className="form-field">
                <label>Amount {activeTab === 'request' ? 'to Request' : ''}<span className="required">*</span></label>
                <div className="amount-input-wrapper">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value.replace(/[^0-9]/g, ''))}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Note (Optional)</label>
                <input
                  type="text"
                  placeholder={activeTab === 'request' ? 'Add a note for this request' : 'Add a note or reference for this payment'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <button type="submit" className="send-payment-btn" disabled={loading}>
                {loading ? 'Processing...' : activeTab === 'request' ? 'Send Request' : 'Send Payment'}
              </button>
            </form>
          )}
        </div>

        <div className="secure-transfer-notice">
          <h3>Secure Transfer</h3>
          <p>All transactions are encrypted and processed securely. Your financial information is protected with bank-level security.</p>
        </div>
      </div>
    </div>
  );
};

export default TransferMoneyPage;