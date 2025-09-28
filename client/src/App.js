import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import CreditScorePage from './pages/CreditScorePage';
import OfflinePaymentPage from './pages/OfflinePaymentPage';
import TransactionsPage from './pages/TransactionsPage';
import LoginPage from './pages/LoginPage';
import Footer from './components/Footer';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'features':
        return <FeaturesPage />;
      case 'credit-score':
        return <CreditScorePage />;
      case 'offline-payment':
        return <OfflinePaymentPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'login':
        return <LoginPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="App">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
      {currentPage !== 'login' && <Footer />}
    </div>
  );
}

export default App;