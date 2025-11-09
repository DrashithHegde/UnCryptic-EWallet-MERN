import React from 'react';

const ProfilePage = ({ userData = { pinnedFeatures: [], balance: 10000 }, setShowProfile, onLogout, setCurrentPage }) => {
  if (!userData) {
    return null;
  }

  // Ensure pinnedFeatures exists
  userData.pinnedFeatures = userData.pinnedFeatures || ['Credit Score', 'Offline Payments'];

  const handleFeatureClick = (feature) => {
    if (!setShowProfile || !setCurrentPage) return;

    setShowProfile(false);
    if (feature === 'Credit Score') {
      setCurrentPage('credit-score');
    } else if (feature === 'Offline Payments') {
      setCurrentPage('offline-payment');
    } else if (feature === 'Transactions') {
      setCurrentPage('transactions');
    }
  };

  const handleAccountSettings = () => {
    setShowProfile(false);
    // You can create a settings page later
    alert('Account Settings page - Coming soon!');
  };

  return (
    <div className="profile-page">
      <div className="profile-overlay" onClick={() => setShowProfile(false)}></div>

      <div className="profile-panel">
        <div className="profile-header">
          <button className="close-btn" onClick={() => setShowProfile(false)}>✕</button>
          <h2>Logged in as</h2>
        </div>

        <div className="profile-user">
          <div className="profile-avatar">
            {(userData.name && userData.name.charAt(0)) || '?'}
          </div>
          <div className="profile-info">
            <h1>{userData.name || 'User'}</h1>
            <p>{userData.email || 'No email provided'}</p>
            {userData.phone && <p>Phone: {userData.phone}</p>}
            <p className="user-id">ID: {userData._id || userData.id || 'N/A'}</p>
          </div>
        </div>

        <div className="profile-section">
          <h3>QUICK SUMMARY</h3>
          <div className="summary-grid-single">
            <div className="summary-card">
              <span className="summary-label">Available Balance</span>
              <h4>₹{(userData.balance || 10000).toLocaleString()}</h4>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>FEATURES</h3>
          <div className="features-stack">
            <div className="feature-card" onClick={() => handleFeatureClick('Credit Score')}>
              <div className="feature-icon">📊</div>
              <div className="feature-content">
                <div className="feature-name">Credit Score</div>
                <div className="feature-desc">Check your credit rating</div>
              </div>
              <div className="feature-arrow">→</div>
            </div>

            <div className="feature-card" onClick={() => handleFeatureClick('Offline Payments')}>
              <div className="feature-icon">📡</div>
              <div className="feature-content">
                <div className="feature-name">Offline Payments</div>
                <div className="feature-desc">Pay without internet</div>
              </div>
              <div className="feature-arrow">→</div>
            </div>

            <div className="feature-card" onClick={() => handleFeatureClick('Transactions')}>
              <div className="feature-icon">📈</div>
              <div className="feature-content">
                <div className="feature-name">Transaction History</div>
                <div className="feature-desc">View all your transactions</div>
              </div>
              <div className="feature-arrow">→</div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="action-btn settings-btn" onClick={handleAccountSettings}>
            <span>⚙️</span>
            Account settings
          </button>
          <button className="action-btn signout-btn" onClick={onLogout}>
            <span>🚪</span>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;