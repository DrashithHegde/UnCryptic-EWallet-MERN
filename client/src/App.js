import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import CreditScorePage from './pages/CreditScorePage';
import OfflinePaymentPage from './pages/OfflinePaymentPage';
import TransactionsPage from './pages/TransactionsPage';
import MoneyActionsPage from './pages/MoneyActionsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import Footer from './components/Footer';
import api from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState(() => {
    try {
      const storedData = localStorage.getItem('userData');
      const token = localStorage.getItem('token');

      console.log('Initializing userData:', { storedData: !!storedData, token: !!token });

      if (!storedData || !token) {
        return null; // Return null if no valid user data
      }

      const parsedData = JSON.parse(storedData);
      console.log('Parsed user data:', parsedData);

      return {
        ...parsedData,
        preferredChannel: parsedData.preferredChannel || 'UPI + Offline QR',
        pinnedFeatures: parsedData.pinnedFeatures || ['Credit Score', 'QR Payments'],
        balance: parsedData.balance || 0,
        phone: parsedData.phone || ''
      };
    } catch (error) {
      console.error('Error parsing userData from localStorage:', error);
      return null;
    }
  });

  // Validate and load user data on app start
  useEffect(() => {
    const validateUserData = async () => {
      const token = localStorage.getItem('token');
      const storedUserData = localStorage.getItem('userData');

      if (token && !userData) {
        try {
          console.log('Token found but no userData, fetching user data...');
          const response = await api.get('/api/auth/me');
          const userInfo = response.data;

          console.log('Fetched user data:', userInfo);

          const userData = {
            ...userInfo,
            preferredChannel: userInfo.preferredChannel || 'UPI + Offline QR',
            pinnedFeatures: userInfo.pinnedFeatures || ['Credit Score', 'QR Payments'],
            balance: userInfo.balance || 10000
          };

          setUserData(userData);
          setIsLoggedIn(true);
          localStorage.setItem('userData', JSON.stringify(userData));

          if (currentPage === 'login') {
            setCurrentPage('home');
          }
        } catch (error) {
          console.error('Failed to validate user data:', error);
          // Clear invalid token/data
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setIsLoggedIn(false);
          setUserData(null);
          setCurrentPage('login');
        }
      } else if (!token) {
        // No token, ensure we're logged out
        setIsLoggedIn(false);
        setUserData(null);
        setCurrentPage('login');
      }
    };

    validateUserData();
  }, []); // Run once on app start

  const handleLogin = (userInfo) => {
    console.log('handleLogin called with:', userInfo);

    // Create user data object with defaults
    const userData = {
      ...userInfo,
      preferredChannel: userInfo.preferredChannel || 'UPI + Offline QR',
      pinnedFeatures: userInfo.pinnedFeatures || ['Credit Score', 'QR Payments'],
      balance: userInfo.balance || 10000 // Ensure balance has a default value
    };

    console.log('Setting userData to:', userData);
    console.log('Setting isLoggedIn to true and navigating to home');

    setUserData(userData);
    setIsLoggedIn(true);
    setCurrentPage('home');
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const handleSignup = (userData) => {
    // userData now comes directly from the backend with correct balance
    const processedUserData = {
      ...userData,
      preferredChannel: 'UPI + Offline QR',
      pinnedFeatures: ['Credit Score', 'QR Payments'],
      balance: userData.balance || 10000 // Ensure balance exists
    };
    setUserData(userData);
    setIsLoggedIn(true);
    setCurrentPage('home');
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
    setShowProfile(false);
    setUserData({
      name: '',
      email: '',
      preferredChannel: 'UPI + Offline QR',
      pinnedFeatures: ['Credit Score', 'QR Payments'],
      balance: 10000 // Initialize with ₹10,000
    });
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
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
      return <ProfilePage userData={userData} setShowProfile={setShowProfile} onLogout={handleLogout} setCurrentPage={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'features':
        return <FeaturesPage setCurrentPage={setCurrentPage} />;
      case 'credit-score':
        return <CreditScorePage />;
      case 'offline-payment':
        return <OfflinePaymentPage />;
      case 'transactions':
        return <TransactionsPage userData={userData} setUserData={setUserData} />;
      case 'money-actions':
        return <MoneyActionsPage userData={userData} setUserData={setUserData} />;
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