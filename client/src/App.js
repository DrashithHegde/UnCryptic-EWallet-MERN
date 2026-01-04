import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreditScorePage from './pages/CreditScorePage';
import TransactionsPage from './pages/TransactionsPage';
import TransferMoneyPage from './pages/TransferMoneyPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import Footer from './components/Footer';
import api from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showProfile, setShowProfile] = useState(false);
  const [transferData, setTransferData] = useState({ email: '', amount: '' });
  const [userData, setUserData] = useState(() => {
    try {
      const storedData = localStorage.getItem('userData');
      const token = localStorage.getItem('token');

      if (!storedData || !token) return null;

      return JSON.parse(storedData);
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    const validateUserData = async () => {
      const token = localStorage.getItem('token');

      if (token && !userData) {
        try {
          const response = await api.get('/api/auth/me');
          setUserData(response.data);
          setIsLoggedIn(true);
          localStorage.setItem('userData', JSON.stringify(response.data));
          setCurrentPage('home');
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setIsLoggedIn(false);
          setUserData(null);
          setCurrentPage('login');
        }
      } else if (!token) {
        setIsLoggedIn(false);
        setUserData(null);
        setCurrentPage('login');
      }
    };

    validateUserData();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, showProfile]);

  const handleLogin = (userInfo) => {
    setUserData(userInfo);
    setIsLoggedIn(true);
    setCurrentPage('home');
    localStorage.setItem('userData', JSON.stringify(userInfo));
  };

  const handleSignup = (userData) => {
    setUserData(userData);
    setIsLoggedIn(true);
    setCurrentPage('home');
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
    setShowProfile(false);
    setUserData(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  };

  const renderPage = () => {
    if (!isLoggedIn) {
      switch (currentPage) {
        case 'login':
          return <LoginPage setCurrentPage={setCurrentPage} onLogin={handleLogin} />;
        case 'signup':
          return <SignUpPage setCurrentPage={setCurrentPage} onSignup={handleSignup} />;
        default:
          return <LoginPage setCurrentPage={setCurrentPage} onLogin={handleLogin} />;
      }
    }

    if (showProfile) {
      return <ProfilePage userData={userData} setUserData={setUserData} setShowProfile={setShowProfile} onLogout={handleLogout} setCurrentPage={setCurrentPage} setTransferData={setTransferData} showProfile={showProfile} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'credit-score':
        return <CreditScorePage userData={userData} />;
      case 'transactions':
        return <TransactionsPage userData={userData} setUserData={setUserData} />;
      case 'transfer-money':
        return <TransferMoneyPage initialTab="pay" userData={userData} setUserData={setUserData} transferData={transferData} setTransferData={setTransferData} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      {isLoggedIn && (
        <Navbar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setShowProfile={setShowProfile}
          userData={userData}
        />
      )}
      {renderPage()}
      {isLoggedIn && currentPage !== 'login' && currentPage !== 'signup' && !showProfile && <Footer />}
    </div>
  );
}

export default App;