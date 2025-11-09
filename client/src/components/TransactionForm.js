import React, { useState } from 'react';
import api from '../services/api';

const TransactionForm = ({ userData, setUserData, onClose }) => {
    const [formData, setFormData] = useState({
        receiverEmail: '',
        amount: '',
        description: '',
        type: 'online',
        transactionType: 'pay' // 'pay' or 'withdraw'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate amount
            const amount = parseFloat(formData.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            if (formData.transactionType === 'pay') {
                if (amount > userData.balance) {
                    throw new Error('Insufficient balance');
                }

                // Make API call to create payment transaction
                await api.post('/api/transactions', {
                    receiverEmail: formData.receiverEmail,
                    amount: amount,
                    description: formData.description,
                    type: formData.type,
                    transactionType: 'payment'
                });

                // Update user data with new balance
                setUserData(prev => ({
                    ...prev,
                    balance: prev.balance - amount
                }));
            } else {
                // Make API call for withdrawal
                await api.post('/api/transactions/withdraw', {
                    amount: amount,
                    description: formData.description || 'Withdrawal to bank account',
                    type: 'withdrawal'
                });

                // Update user data with new balance
                setUserData(prev => ({
                    ...prev,
                    balance: prev.balance + amount
                }));
            }

            // Close form and show success message
            onClose();
            alert(`${formData.transactionType === 'pay' ? 'Payment' : 'Withdrawal'} successful!`);

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transaction-form-container">
            <div className="transaction-form">
                <h2>{formData.transactionType === 'pay' ? 'Send Money' : 'Withdraw Money'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group transaction-type-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${formData.transactionType === 'pay' ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, transactionType: 'pay' }))}
                        >
                            Pay
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${formData.transactionType === 'withdraw' ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, transactionType: 'withdraw' }))}
                        >
                            Withdraw
                        </button>
                    </div>

                    {formData.transactionType === 'pay' && (
                        <div className="form-group">
                            <label>Receiver's Email</label>
                            <input
                                type="email"
                                name="receiverEmail"
                                value={formData.receiverEmail}
                                onChange={handleChange}
                                required
                                placeholder="Enter receiver's email"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Amount (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            min="1"
                            placeholder="Enter amount"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter description"
                        />
                    </div>

                    <div className="form-group">
                        <label>Payment Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        >
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Send Money'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionForm;