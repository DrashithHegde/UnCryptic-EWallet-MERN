import React, { useState, useEffect } from 'react';
import { getCreditScore, getMoneyRequests, acceptMoneyRequest, rejectMoneyRequest, getUserProfile } from '../services/api';

const ProfilePage = ({ userData, setShowProfile, onLogout, setCurrentPage, setTransferData, showProfile, setUserData }) => {
  const [moneyRequests, setMoneyRequests] = useState([]);
  const [creditScore, setCreditScore] = useState(0);

  useEffect(() => {
    if (showProfile) {
      refreshProfileData();
      fetchCreditScore();
      fetchMoneyRequests();
    }
  }, [showProfile]);

  const refreshProfileData = async () => {
    try {
      const profile = await getUserProfile();
      setUserData(profile);
      localStorage.setItem('userData', JSON.stringify(profile));
    } catch (error) {
      // Silent error handling
    }
  };

  const fetchMoneyRequests = async () => {
    try {
      const requests = await getMoneyRequests();
      const formattedRequests = requests.map(req => ({
        id: req._id,
        name: req.userName,
        email: req.userEmail,
        amount: `₹${req.amount.toLocaleString()}`,
        time: new Date(req.createdAt).toLocaleDateString(),
      }));
      setMoneyRequests(formattedRequests);
    } catch (error) {
      // Silent error handling
    }
  };

  const fetchCreditScore = async () => {
    try {
      const data = await getCreditScore();
      setCreditScore(data.score || 700);
    } catch (error) {
      setCreditScore(700);
    }
  };

  const handleFeatureClick = (feature) => {
    setShowProfile(false);
    if (feature === 'Credit Score') {
      setCurrentPage('credit-score');
    } else if (feature === 'Offline Payments') {
      setCurrentPage('offline-payment');
    } else if (feature === 'Transactions') {
      setCurrentPage('transactions');
    }
  };

  const handleAcceptRequest = async (index) => {
    try {
      const request = moneyRequests[index];
      const amountValue = request.amount.replace(/[₹,]/g, '');
      await acceptMoneyRequest(request.id);
      setTransferData({ email: request.email, amount: amountValue });
      setMoneyRequests(moneyRequests.filter((_, i) => i !== index));
      setShowProfile(false);
      setCurrentPage('transfer-money');
    } catch (error) {
      alert('Error accepting request: ' + error.response?.data?.message);
    }
  };

  const handleDeclineRequest = async (index) => {
    try {
      const request = moneyRequests[index];
      await rejectMoneyRequest(request.id);
      setMoneyRequests(moneyRequests.filter((_, i) => i !== index));
    } catch (error) {
      alert('Error declining request: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-overlay" onClick={() => setShowProfile(false)}></div>

      <div className="profile-panel">
        <div className="profile-header">
          <button className="close-btn" onClick={() => setShowProfile(false)}>✕</button>
          <h2>My <span className="highlight-text">Profile</span></h2>
        </div>

        <div className="profile-user">
          <div className="profile-info">
            <h1>{userData.name}</h1>
            <p>{userData.email}</p>
            <p>{userData.phone ? `+91 ${userData.phone}` : 'Not provided'}</p>
          </div>
          <div className="profile-cards-right">
            <div className="credit-score-card-small">
              <div className="score-label-top">Credit Score</div>
              <div className="score-display-large">{creditScore}</div>
            </div>

            <div className="balance-card-profile-small">
              <div className="balance-label-profile">Balance</div>
              <div className="balance-amount-profile">₹{userData.balance?.toLocaleString() || '0'}</div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>MONEY REQUESTS</h3>
          <div className="money-requests-list">
            {moneyRequests.length > 0 ? (
              moneyRequests.map((request, index) => (
                <div key={index} className="money-request-item">
                  <div className="request-avatar">
                    {request.name.charAt(0)}
                  </div>
                  <div className="request-info">
                    <div className="request-name">{request.name}</div>
                    <div className="request-details">
                      <span className="request-amount">Requested {request.amount}</span>
                      <span className="request-time">{request.time}</span>
                    </div>
                  </div>
                  <div className="request-actions">
                    <button className="accept-btn" onClick={() => handleAcceptRequest(index)}>Accept</button>
                    <button className="decline-btn" onClick={() => handleDeclineRequest(index)}>Decline</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-requests">
                <p>No pending money requests</p>
              </div>
            )}
          </div>
        </div>

        <div className="profile-actions">
          <button className="action-btn signout-btn" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;