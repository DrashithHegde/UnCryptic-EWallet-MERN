import React, { useState } from 'react';

const TransactionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const transactions = [
    {
      id: 1,
      type: 'received',
      title: 'Received from Atharva More',
      description: 'Lunch split payment',
      amount: '+₹2,500',
      date: '2024-01-15 • 14:30',
      method: 'UPI',
      category: 'Transfer',
      status: 'completed'
    },
    {
      id: 2,
      type: 'sent',
      title: 'Paid to Dhruv Iyer',
      description: 'Restaurant bill',
      amount: '-₹1,000',
      date: '2024-01-15 • 12:15',
      method: 'QR',
      category: 'Food',
      status: 'completed'
    },
    {
      id: 3,
      type: 'sent',
      title: 'Paid to Airtel',
      description: 'Mobile recharge',
      amount: '-₹1,200',
      date: '2024-01-14 • 10:45',
      method: 'UPI',
      category: 'Bills',
      status: 'completed'
    },
    {
      id: 4,
      type: 'received',
      title: 'Received from Ayush Jena',
      description: 'Freelance payment',
      amount: '+₹10,000',
      date: '2024-01-14 • 16:20',
      method: 'Bank Transfer',
      category: 'Transfer',
      status: 'completed'
    },
    {
      id: 5,
      type: 'sent',
      title: 'Paid to Amazon',
      description: 'Electronics purchase',
      amount: '-₹3,200',
      date: '2024-01-13 • 11:30',
      method: 'Wallet',
      category: 'Shopping',
      status: 'completed'
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || 
                         (filterType === 'Sent' && transaction.type === 'sent') ||
                         (filterType === 'Received' && transaction.type === 'received');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h1>Transaction History</h1>
        <p>Track all your payments and receipts in one place</p>
      </div>

      <div className="balance-summary">
        <div className="balance-card sent">
          <h3>Total Sent</h3>
          <div className="balance-amount">₹5,400</div>
        </div>
        <div className="balance-card received">
          <h3>Total Received</h3>
          <div className="balance-amount">₹12,500</div>
        </div>
        <div className="balance-card net">
          <h3>Net Balance</h3>
          <div className="balance-amount">₹7,100</div>
        </div>
      </div>

      <div className="transactions-controls">
        <h2>Recent Transactions</h2>
        <div className="controls-row">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            <button
              className={filterType === 'All' ? 'active' : ''}
              onClick={() => setFilterType('All')}
            >
              All
            </button>
            <button
              className={filterType === 'Sent' ? 'active' : ''}
              onClick={() => setFilterType('Sent')}
            >
              Sent
            </button>
            <button
              className={filterType === 'Received' ? 'active' : ''}
              onClick={() => setFilterType('Received')}
            >
              Received
            </button>
          </div>
          <div className="action-buttons">
            <button className="btn-secondary">Date Range</button>
            <button className="btn-secondary">Export</button>
          </div>
        </div>
      </div>

      <div className="transactions-list">
        {filteredTransactions.map(transaction => (
          <div key={transaction.id} className="transaction-item">
            <div className="transaction-icon">
              <div className={`icon-circle ${transaction.type}`}>
                {transaction.type === 'received' ? '↓' : '↑'}
              </div>
            </div>
            <div className="transaction-details">
              <h4>{transaction.title}</h4>
              <p>{transaction.description}</p>
              <div className="transaction-tags">
                <span className="tag method">{transaction.method}</span>
                <span className="tag category">{transaction.category}</span>
                <span className="tag status">{transaction.status}</span>
              </div>
            </div>
            <div className="transaction-amount">
              <div className={`amount ${transaction.type}`}>
                {transaction.amount}
              </div>
              <div className="date">{transaction.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsPage;