import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './TransactionsPage.css';

const TransactionsPage = ({ userData, setUserData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ sent: 0, received: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch transactions when component mounts or userData changes
  useEffect(() => {
    fetchTransactions();
  }, [userData]);

  const fetchTransactions = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('No token found, redirecting to login');
      setError('Please log in to view transactions');
      setLoading(false);
      return;
    }

    if (!userData) {
      console.log('No user data available, waiting for user data...');
      setLoading(false);
      return;
    }

    if (!userData._id && !userData.id) {
      console.log('User data missing ID field:', userData);
      setError('Invalid user data. Please log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Fetching transactions for user:', userData._id);
      console.log('Using token:', token ? 'Present' : 'Missing');

      const response = await api.get('/api/transactions/my');

      // Handle new response format
      const transactionData = response.data?.data || response.data || [];

      console.log('API Response:', {
        success: response.data?.success,
        count: response.data?.count,
        dataLength: transactionData.length,
        rawData: transactionData
      });

      // Log each transaction for debugging
      transactionData.forEach((tx, index) => {
        console.log(`Frontend Transaction ${index + 1}:`, {
          id: tx._id,
          userId: tx.userId?._id,
          receiverId: tx.receiverId?._id,
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          isCurrentUser: tx.userId?._id === userData._id
        });
      });

      let totalSent = 0;
      let totalReceived = 0;

      const processedTransactions = transactionData.map(t => {
        console.log('Processing transaction:', t);

        // Calculate totals based on transaction type
        if (t.type === 'debit') {
          totalSent += t.amount;
        } else if (t.type === 'credit') {
          totalReceived += t.amount;
        }

        // Get recipient information (the person you sent money to or received from)
        const otherParty = t.receiverId;
        const otherPartyName = otherParty?.name || otherParty?.email || 'Unknown User';

        return {
          id: t._id,
          type: t.type === 'debit' ? 'sent' : 'received',
          title: t.type === 'debit' ?
            `Money Sent to ${otherPartyName}` :
            `Money Received from ${otherPartyName}`,
          description: t.description || 'No description',
          amount: t.type === 'debit' ?
            `-₹${t.amount.toLocaleString()}` :
            `+₹${t.amount.toLocaleString()}`,
          date: new Date(t.timestamp).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          method: t.method ? t.method.charAt(0).toUpperCase() + t.method.slice(1) : 'Online',
          status: t.status || 'success',
          raw: {
            yourEmail: t.userId?.email || userData.email,
            otherPartyEmail: t.receiverId?.email || t.receiverId?.name || 'Unknown',
            transactionType: t.type,
            amount: t.amount,
            timestamp: t.timestamp,
            status: t.status,
            description: t.description || 'No description',
            method: t.method || 'online'
          }
        };
      });

      console.log('Processed transactions:', processedTransactions);
      setTransactions(processedTransactions);
      setTotals({
        sent: totalSent,
        received: totalReceived
      });
    } catch (err) {
      console.error('Error fetching transactions:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });

      let errorMessage = 'Failed to fetch transactions';

      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (!transaction) return false;

    const matchesSearch = searchTerm === '' ||
      (transaction.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transaction.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transaction.raw?.fromUser?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (transaction.raw?.toUser?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'All' ||
      (filterType === 'Sent' && transaction.type === 'sent') ||
      (filterType === 'Received' && transaction.type === 'received');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="transactions-page">
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-header">
            <span className="card-icon sent">↗</span>
          </div>
          <div className="card-content">
            <h3>Total Sent</h3>
            <div className="card-amount sent">₹{totals.sent.toLocaleString()}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-header">
            <span className="card-icon received">↙</span>
          </div>
          <div className="card-content">
            <h3>Total Received</h3>
            <div className="card-amount received">₹{totals.received.toLocaleString()}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-header">
            <span className="card-icon balance">🔄</span>
          </div>
          <div className="card-content">
            <h3>Net Balance</h3>
            <div className="card-amount balance">₹{(totals.received - totals.sent).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Transaction History Header */}
      <div className="transactions-section">
        <div className="section-header">
          <h2>Transaction History</h2>
        </div>

        {/* Search and Filters */}
        <div className="transaction-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterType === 'All' ? 'active' : ''}`}
              onClick={() => setFilterType('All')}
            >
              All
            </button>
            <button
              className={`filter-tab ${filterType === 'Sent' ? 'active' : ''}`}
              onClick={() => setFilterType('Sent')}
            >
              Sent
            </button>
            <button
              className={`filter-tab ${filterType === 'Received' ? 'active' : ''}`}
              onClick={() => setFilterType('Received')}
            >
              Received
            </button>
          </div>
        </div>
      </div>



      <div className="transactions-list">
        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : error ? (
          <div className="error-message">
            {error}
            <button
              onClick={fetchTransactions}
              style={{ marginLeft: '1rem', padding: '0.5rem' }}
            >
              Retry
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="no-transactions">
            No transactions found
            {transactions.length === 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                Try making a transaction first, then refresh this page
              </div>
            )}
          </div>
        ) : (
          filteredTransactions.map(transaction => (
            <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
              <div className="transaction-icon">
                <span className={`icon ${transaction.type}`}>
                  {transaction.type === 'received' ? '↙' : '↗'}
                </span>
              </div>

              <div className="transaction-details">
                <div className="transaction-title">
                  {transaction.type === 'received' ? 'Received from' : 'Paid to'} {transaction.raw.otherPartyEmail.split('@')[0] || 'Unknown User'}
                </div>

                <div className="transaction-subtitle">
                  {transaction.raw.description && transaction.raw.description !== 'No description' ? transaction.raw.description : (transaction.type === 'received' ? 'Money received' : 'Payment sent')}
                </div>

                <div className="transaction-date">
                  {new Date(transaction.raw.timestamp).toLocaleDateString('en-CA')} • {new Date(transaction.raw.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>

                <div className="meta-tags">
                  <span className="tag method">{transaction.method === 'Offline' ? 'QR' : 'UPI'}</span>
                  <span className="tag category">{transaction.raw.description && (transaction.raw.description.includes('food') || transaction.raw.description.includes('restaurant') || transaction.raw.description.includes('lunch') || transaction.raw.description.includes('bill')) ? 'Food' : transaction.raw.description && (transaction.raw.description.includes('mobile') || transaction.raw.description.includes('recharge') || transaction.raw.description.includes('bill')) ? 'Bills' : 'Transfer'}</span>
                  <span className="tag status">completed</span>
                </div>
              </div>

              <div className="transaction-amount">
                <div className={`amount ${transaction.type}`}>
                  {transaction.type === 'received' ? '+' : '-'}₹{transaction.raw.amount.toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;