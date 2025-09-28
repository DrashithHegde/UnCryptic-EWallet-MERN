import React from 'react';

const FeaturesPage = () => {
  const features = [
    {
      icon: '📱',
      title: 'Mobile First',
      description: 'Designed for mobile devices with a seamless user experience across all platforms.'
    },
    {
      icon: '🛡️',
      title: 'Bank-Grade Security',
      description: 'Multi-layer security with end-to-end encryption and biometric authentication.'
    },
    {
      icon: '⚡',
      title: 'Instant Transfers',
      description: 'Send money instantly using UPI, IMPS, or NEFT with real-time notifications.'
    },
    {
      icon: '💳',
      title: 'Bill Payments',
      description: 'Pay all your bills in one place - utilities, recharges, insurance, and more.'
    },
    {
      icon: '📊',
      title: 'QR Payments',
      description: 'Scan and pay at any merchant or generate QR codes for receiving payments.'
    },
    {
      icon: '📈',
      title: 'Expense Tracking',
      description: 'Track your spending with detailed analytics and smart categorization.'
    },
    {
      icon: '👥',
      title: 'Split Bills',
      description: 'Easily split bills with friends and family with automatic calculations.'
    },
    {
      icon: '🌐',
      title: 'Multilingual Support',
      description: 'Available in multiple Indian languages including Hindi, Tamil, Telugu, and more.'
    },
    {
      icon: '⏰',
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you with any issues.'
    }
  ];

  return (
    <div className="features-page">
      <div className="features-header">
        <h1>Everything You Need for<span className="highlight">Digital Payments</span></h1>
        <p>From instant transfers to bill payments, UnCryptic provides all the tools you need to manage your money digitally.</p>
      </div>
      
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="cta-section">
        <h2>Ready to Start Your Digital Payment Journey?</h2>
        <p>Join millions of users who trust UnCryptic for their daily financial transactions.</p>
        <div className="cta-buttons">
          <button className="btn-primary">Download App</button>
          <button className="btn-secondary">Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;