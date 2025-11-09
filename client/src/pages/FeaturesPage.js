import React from 'react';

const FeaturesPage = ({ setCurrentPage }) => {
  const features = [
    {
      icon: '📊',
      title: 'Credit Score Simulator',
      description: 'Interactive simulator to understand and improve your credit score with real-time calculations.',
      onClick: () => setCurrentPage('credit-score')
    },
    {
      icon: '⚡',
      title: 'Send Money',
      description: 'Send money instantly using UPI, IMPS, or NEFT with real-time notifications.',
      onClick: () => setCurrentPage('money-actions')
    },
    {
      icon: '📱',
      title: 'QR Payments',
      description: 'Scan and pay at any merchant or generate QR codes for receiving payments.',
      onClick: () => setCurrentPage('offline-payment')
    },
    {
      icon: '⏰',
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you with any issues.',
      onClick: () => alert('Support feature coming soon!')
    }
  ];

  return (
    <div className="features-page">
      <div className="features-header">
        <h1>Everything You Need for<span className="highlight">Digital Payments</span></h1>
        <p>From sending money to QR payments, UnCryptic provides all the tools you need to manage your money digitally.</p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div
            key={index}
            className="feature-card clickable"
            onClick={feature.onClick}
          >
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesPage;