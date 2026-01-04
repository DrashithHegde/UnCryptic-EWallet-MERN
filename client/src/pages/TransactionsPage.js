import React, { useState, useEffect, useRef } from 'react';
import { getTransactions } from '../services/api';

const TransactionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    setCurrentUserId(userData._id || userData.id);
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData._id || userData.id;

      const formattedTransactions = data
        .filter(tx => tx.type === 'payment')
        .map(tx => {
          const isUserSender = tx.userId._id === userId;
          const senderName = tx.userId.name || tx.userId.email;
          const receiverName = tx.receiverId.name || tx.receiverId.email;

          // Only show custom description if it's not the auto-generated one
          const hasCustomDescription = tx.description && !tx.description.startsWith('Payment to');

          return {
            id: tx._id,
            type: isUserSender ? 'sent' : 'received',
            title: isUserSender
              ? `Paid to ${receiverName}`
              : `Received from ${senderName}`,
            description: hasCustomDescription ? tx.description : 'Transaction',
            amount: isUserSender ? `-₹${tx.amount}` : `+₹${tx.amount}`,
            date: new Date(tx.createdAt).toLocaleString(),
            method: tx.method || 'UPI',
            status: tx.status,
            actualAmount: tx.amount
          };
        });
      setTransactions(formattedTransactions);
      setLoading(false);
    } catch (err) {
      setError('Failed to load transactions');
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' ||
      (filterType === 'Sent' && transaction.type === 'sent') ||
      (filterType === 'Received' && transaction.type === 'received');
    return matchesSearch && matchesFilter;
  });

  if (error) return <div className="transactions-page-new"><div className="transactions-container-new">{error}</div></div>;

  const totalSent = transactions
    .filter(t => t.type === 'sent')
    .reduce((sum, t) => sum + t.actualAmount, 0);

  const totalReceived = transactions
    .filter(t => t.type === 'received')
    .reduce((sum, t) => sum + t.actualAmount, 0);

  const netBalance = totalReceived - totalSent;

  return (
    <div className="transactions-page-new">
      <div className="transactions-container-new">
        <div className="transactions-header-new">
          <h1>Transaction <span className="highlight">History</span></h1>
          <p>Track all your payments and receipts in one place</p>
        </div>

        <div className="balance-summary-new">
          <div className="balance-card-new sent">
            <div className="balance-label">Total Sent</div>
            <div className="balance-icon-amount">
              <span className="balance-icon sent-icon">↗</span>
              <span className="balance-amount">₹{totalSent.toLocaleString()}</span>
            </div>
          </div>
          <div className="balance-card-new received">
            <div className="balance-label">Total Received</div>
            <div className="balance-icon-amount">
              <span className="balance-icon received-icon">↙</span>
              <span className="balance-amount">₹{totalReceived.toLocaleString()}</span>
            </div>
          </div>
          <div className="balance-card-new net">
            <div className="balance-label">Net Balance</div>
            <div className="balance-icon-amount">
              <span className="balance-icon net-icon">🔄</span>
              <span className="balance-amount">₹{netBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="transactions-controls-new">
          <div className="controls-header">
            <h2>Recent Transactions</h2>
          </div>

          <div className="controls-row-new">
            <div className="search-container-new">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-new"
              />
            </div>
            <div className="filter-buttons-new">
              <button
                className={`filter-btn ${filterType === 'All' ? 'active' : ''}`}
                onClick={() => setFilterType('All')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filterType === 'Sent' ? 'active' : ''}`}
                onClick={() => setFilterType('Sent')}
              >
                Sent
              </button>
              <button
                className={`filter-btn ${filterType === 'Received' ? 'active' : ''}`}
                onClick={() => setFilterType('Received')}
              >
                Received
              </button>
            </div>
          </div>
        </div>

        <div className="transactions-list-new">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map(transaction => (
              <div key={transaction.id} className="transaction-item-new">
                <div className="transaction-left">
                  <div className={`transaction-icon-new ${transaction.type}`}>
                    {transaction.type === 'received' ? '↓' : '↑'}
                  </div>
                  <div className="transaction-details-new">
                    <h4>{transaction.title}</h4>
                    <p>{transaction.description}</p>
                    <div className="transaction-tags-new">
                      <span className="tag method">{transaction.method}</span>
                      <span className="tag status">{transaction.status}</span>
                    </div>
                  </div>
                </div>
                <div className="transaction-right">
                  <div className={`transaction-amount-new ${transaction.type}`}>
                    {transaction.amount}
                  </div>
                  <div className="transaction-date">{transaction.date}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>No transactions found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;