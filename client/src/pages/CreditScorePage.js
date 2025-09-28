import React, { useState, useEffect } from 'react';

const CreditScorePage = () => {
  const [creditScore, setCreditScore] = useState(723);
  const [originalScore] = useState(720);
  const [paymentHistory, setPaymentHistory] = useState(85);
  const [creditUtilization, setCreditUtilization] = useState(25);
  const [creditHistory, setCreditHistory] = useState(70);
  const [creditMix, setCreditMix] = useState(60);
  const [newInquiries, setNewInquiries] = useState(20);

  // Calculate score whenever sliders change
  useEffect(() => {
    const calculateScore = () => {
      const newScore = Math.round(
        (paymentHistory * 0.35) + 
        ((100 - creditUtilization) * 0.30) + 
        (creditHistory * 0.15) + 
        (creditMix * 0.10) + 
        ((100 - newInquiries) * 0.10)
      ) * 8.5;
      setCreditScore(Math.min(850, Math.max(300, newScore)));
    };
    calculateScore();
  }, [paymentHistory, creditUtilization, creditHistory, creditMix, newInquiries]);

  const optimizeScore = () => {
    setPaymentHistory(95);
    setCreditUtilization(15);
    setCreditHistory(85);
    setCreditMix(80);
    setNewInquiries(5);
  };

  const getScoreColor = () => {
    if (creditScore >= 750) return '#10B981';
    if (creditScore >= 700) return '#F59E0B';
    if (creditScore >= 650) return '#EF4444';
    return '#DC2626';
  };

  const getScoreLabel = () => {
    if (creditScore >= 750) return 'Excellent';
    if (creditScore >= 700) return 'Good';
    if (creditScore >= 650) return 'Fair';
    return 'Poor';
  };

  const getFactorStatus = (value, isReverse = false) => {
    const threshold = isReverse ? 30 : 80;
    if (isReverse) {
      return value <= threshold ? 'good' : 'needs-improvement';
    }
    return value >= threshold ? 'good' : 'needs-improvement';
  };

  return (
    <div className="credit-score-page">
      <div className="credit-header">
        <h1>Interactive Credit Score<span className="highlight">Simulator</span></h1>
        <p>Adjust the parameters below and see how they affect your credit score in real-time.</p>
      </div>

      <div className="credit-score-display">
        <h3>Your Credit Score</h3>
        <p>Updates in real-time as you adjust parameters</p>
        <div className="score-circle">
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="20"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={getScoreColor()}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${(creditScore - 300) / 550 * 502} 502`}
              transform="rotate(-90 100 100)"
              style={{
                transition: 'stroke-dasharray 0.5s ease, stroke 0.3s ease'
              }}
            />
          </svg>
          <div className="score-text">
            <div className="score-number">{creditScore}</div>
            <div className="score-max">/ 850</div>
            <div className="score-label" style={{ backgroundColor: getScoreColor() }}>
              {getScoreLabel()}
            </div>
          </div>
        </div>
        <div className="score-change">
          <span>Original: {originalScore}</span>
          <span>Current: {creditScore}</span>
          <span className={`improvement ${creditScore >= originalScore ? 'positive' : 'negative'}`}>
            {creditScore >= originalScore ? '+' : ''}{creditScore - originalScore} points
          </span>
        </div>
        <button className="optimize-btn" onClick={optimizeScore}>
          Optimize Score
        </button>
      </div>

      <div className="score-ranges">
        <h3>Credit Score Ranges</h3>
        <div className="ranges">
          <div className="range excellent">
            <span className="range-label">Excellent</span>
            <span className="range-value">750-850</span>
          </div>
          <div className="range good">
            <span className="range-label">Good</span>
            <span className="range-value">700-749</span>
          </div>
          <div className="range fair">
            <span className="range-label">Fair</span>
            <span className="range-value">650-699</span>
          </div>
          <div className="range poor">
            <span className="range-label">Poor</span>
            <span className="range-value">300-649</span>
          </div>
        </div>
      </div>

      <div className="credit-factors">
        <h3>Adjust Credit Factors</h3>
        <p>Move the sliders to see how different factors affect your score</p>
        
        <div className="factor">
          <div className="factor-header">
            <h4>Payment History</h4>
            <span>35% weight</span>
          </div>
          <p>Your track record of making payments on time</p>
          <div className="slider-container">
            <span className="slider-label">0%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={paymentHistory}
              onChange={(e) => setPaymentHistory(parseInt(e.target.value))}
              className="slider"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${paymentHistory}%, #e5e7eb ${paymentHistory}%, #e5e7eb 100%)`
              }}
            />
            <span className="slider-label">Ideal: 90-100%</span>
            <div className="slider-value">{paymentHistory}%</div>
          </div>
          <div className={`factor-status ${getFactorStatus(paymentHistory)}`}>
            <span>{getFactorStatus(paymentHistory) === 'good' ? '✓ Good' : '⚠ Needs Improvement'}</span>
            <p>
              {getFactorStatus(paymentHistory) === 'good' 
                ? 'Higher values improve your score. Try to keep above 80%.'
                : 'Payment history is the most important factor. Aim for 90%+ for excellent credit.'
              }
            </p>
          </div>
        </div>

        <div className="factor">
          <div className="factor-header">
            <h4>Credit Utilization</h4>
            <span>30% weight</span>
          </div>
          <p>Percentage of available credit you're using</p>
          <div className="slider-container">
            <span className="slider-label">0%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={creditUtilization}
              onChange={(e) => setCreditUtilization(parseInt(e.target.value))}
              className="slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${100-creditUtilization}%, #e5e7eb ${100-creditUtilization}%, #e5e7eb 100%)`
              }}
            />
            <span className="slider-label">Ideal: 0-30%</span>
            <div className="slider-value">{creditUtilization}%</div>
          </div>
          <div className={`factor-status ${getFactorStatus(creditUtilization, true)}`}>
            <span>{getFactorStatus(creditUtilization, true) === 'good' ? '✓ Good' : '⚠ Needs Improvement'}</span>
            <p>
              {getFactorStatus(creditUtilization, true) === 'good' 
                ? 'Lower values improve your score. Try to keep below 30%.'
                : 'High utilization hurts your score. Keep below 10% for excellent credit.'
              }
            </p>
          </div>
        </div>

        <div className="factor">
          <div className="factor-header">
            <h4>Length of Credit History</h4>
            <span>15% weight</span>
          </div>
          <p>How long you've had credit accounts</p>
          <div className="slider-container">
            <span className="slider-label">0%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={creditHistory}
              onChange={(e) => setCreditHistory(parseInt(e.target.value))}
              className="slider"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${creditHistory}%, #e5e7eb ${creditHistory}%, #e5e7eb 100%)`
              }}
            />
            <span className="slider-label">Ideal: 70-100%</span>
            <div className="slider-value">{creditHistory}%</div>
          </div>
          <div className={`factor-status ${getFactorStatus(creditHistory)}`}>
            <span>{getFactorStatus(creditHistory) === 'good' ? '✓ Good' : '⚠ Needs Improvement'}</span>
            <p>
              {getFactorStatus(creditHistory) === 'good' 
                ? 'Longer credit history improves your score.'
                : 'Keep older accounts open to improve credit history length.'
              }
            </p>
          </div>
        </div>

        <div className="factor">
          <div className="factor-header">
            <h4>Credit Mix</h4>
            <span>10% weight</span>
          </div>
          <p>Variety of credit account types</p>
          <div className="slider-container">
            <span className="slider-label">0%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={creditMix}
              onChange={(e) => setCreditMix(parseInt(e.target.value))}
              className="slider"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${creditMix}%, #e5e7eb ${creditMix}%, #e5e7eb 100%)`
              }}
            />
            <span className="slider-label">Ideal: 60-100%</span>
            <div className="slider-value">{creditMix}%</div>
          </div>
          <div className={`factor-status ${getFactorStatus(creditMix)}`}>
            <span>{getFactorStatus(creditMix) === 'good' ? '✓ Good' : '⚠ Needs Improvement'}</span>
            <p>
              {getFactorStatus(creditMix) === 'good' 
                ? 'Good variety of credit types helps your score.'
                : 'Consider having both revolving and installment credit.'
              }
            </p>
          </div>
        </div>

        <div className="factor">
          <div className="factor-header">
            <h4>New Credit Inquiries</h4>
            <span>10% weight</span>
          </div>
          <p>Recent credit applications and inquiries</p>
          <div className="slider-container">
            <span className="slider-label">0%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={newInquiries}
              onChange={(e) => setNewInquiries(parseInt(e.target.value))}
              className="slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${100-newInquiries}%, #e5e7eb ${100-newInquiries}%, #e5e7eb 100%)`
              }}
            />
            <span className="slider-label">Ideal: 0-20%</span>
            <div className="slider-value">{newInquiries}%</div>
          </div>
          <div className={`factor-status ${getFactorStatus(newInquiries, true)}`}>
            <span>{getFactorStatus(newInquiries, true) === 'good' ? '✓ Good' : '⚠ Needs Improvement'}</span>
            <p>
              {getFactorStatus(newInquiries, true) === 'good' 
                ? 'Low number of inquiries is good for your score.'
                : 'Too many recent applications can hurt your score.'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="impact-guide">
        <h3>Impact Guide</h3>
        <div className="impact-items">
          <div className="impact-item">
            <span className="impact-icon">📈</span>
            <span>Payment History: Most important factor (35%)</span>
          </div>
          <div className="impact-item">
            <span className="impact-icon">💳</span>
            <span>Credit Utilization: Keep below 30% (30%)</span>
          </div>
          <div className="impact-item">
            <span className="impact-icon">📅</span>
            <span>Credit History: Longer is better (15%)</span>
          </div>
          <div className="impact-item">
            <span className="impact-icon">🔀</span>
            <span>Credit Mix: Variety helps (10%)</span>
          </div>
          <div className="impact-item">
            <span className="impact-icon">🔍</span>
            <span>New Inquiries: Minimize applications (10%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditScorePage;