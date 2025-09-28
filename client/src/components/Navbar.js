import React from 'react';

const Navbar = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="logo">
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
            className={`nav-item ${currentPage === 'features' ? 'active' : ''}`}
            onClick={() => setCurrentPage('features')}
          >
            Features
          </button>
          <button 
            className={`nav-item ${currentPage === 'credit-score' ? 'active' : ''}`}
            onClick={() => setCurrentPage('credit-score')}
          >
            Credit Score
          </button>
          <button 
            className={`nav-item ${currentPage === 'offline-payment' ? 'active' : ''}`}
            onClick={() => setCurrentPage('offline-payment')}
          >
            Offline Payment
          </button>
          <button 
            className={`nav-item ${currentPage === 'transactions' ? 'active' : ''}`}
            onClick={() => setCurrentPage('transactions')}
          >
            Transactions
          </button>
          <button 
            className={`nav-item ${currentPage === 'login' ? 'active' : ''}`}
            onClick={() => setCurrentPage('login')}
          >
            Login
          </button>
        </div>
        <button className="get-started-btn">Get Started</button>
      </div>
    </nav>
  );
};

export default Navbar;