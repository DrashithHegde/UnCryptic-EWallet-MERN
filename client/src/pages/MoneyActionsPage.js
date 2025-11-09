import React, { useState } from 'react';
import api from '../services/api';
import './MoneyActionsPage.css';

const MoneyActionsPage = ({ userData, setUserData }) => {
    const [formData, setFormData] = useState({
        receiverEmail: '',
        amount: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const amount = parseFloat(formData.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            if (amount > userData.balance) {
                throw new Error('Insufficient balance');
            }

            const response = await api.post('/api/transactions', {
                receiverEmail: formData.receiverEmail,
                amount: amount,
                description: formData.description
            });

            if (response.data) {
                const updatedUser = {
                    ...userData,
                    balance: userData.balance - amount
                };
                setUserData(updatedUser);
                localStorage.setItem('userData', JSON.stringify(updatedUser));

                setSuccess('Money transferred successfully!');
                setFormData({
                    receiverEmail: '',
                    amount: '',
                    description: ''
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="money-actions-page">
            <div className="action-container">
                <h2 className="action-title">Transfer Money</h2>

                <div className="balance-info">
                    <p>Available Balance: <strong>₹{(userData.balance || 0).toLocaleString()}</strong></p>
                </div>

                <form onSubmit={handleSubmit} className="money-action-form">
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

                    <div className="form-group">
                        <label>Amount (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            min="1"
                            max={userData.balance || 0}
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
                            placeholder="What's this payment for?"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Transfer Money'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MoneyActionsPage;