import React from 'react';

const Navbar = ({ currentPage, setCurrentPage, setShowProfile, userData }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="logo" onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">UC</div>
            <span className="logo-text">UnCryptic</span>
          </div>
        </div>
        <div className="nav-menu">
          <button
            className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <button
            className={`nav-item ${currentPage === 'credit-score' ? 'active' : ''}`}
            onClick={() => setCurrentPage('credit-score')}
          >
            Credit Score
          </button>
          <button
            className={`nav-item ${currentPage === 'transfer-money' ? 'active' : ''}`}
            onClick={() => setCurrentPage('transfer-money')}
          >
            Transfer Money
          </button>
          <button
            className={`nav-item ${currentPage === 'transactions' ? 'active' : ''}`}
            onClick={() => setCurrentPage('transactions')}
          >
            Transactions
          </button>
        </div>
        <div className="nav-actions">
          <button
            className="profile-icon"
            onClick={() => setShowProfile(true)}
            title="View Profile"
          >
            <div className="avatar">
              {userData?.name?.charAt(0) || 'A'}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;