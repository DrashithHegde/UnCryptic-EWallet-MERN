import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import CreditScorePage from './pages/CreditScorePage';
import OfflinePaymentPage from './pages/OfflinePaymentPage';
import TransactionsPage from './pages/TransactionsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Footer from './components/Footer';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'features':
        return <FeaturesPage />;
      case 'credit-score':
        return <CreditScorePage />;
      case 'offline-payment':
        return <OfflinePaymentPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} />;
      case 'signup':
        return <SignUpPage setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
      {currentPage !== 'login' && currentPage !== 'signup' && <Footer />}
    </div>
  );
}

export default App;