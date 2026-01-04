import axios from 'axios';

const API_URL = 'http://localhost:5001';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to request headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth Endpoints
export const loginUser = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response;
};

export const registerUser = async (name, email, password, confirmPassword, phone = '') => {
    const response = await api.post('/api/auth/register', {
        fullName: name,
        email,
        password,
        confirmPassword,
        phone
    });
    if (response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response;
};

export const getUserProfile = async () => {
    const response = await api.get('/api/auth/me');
    if (response.data) {
        localStorage.setItem('userData', JSON.stringify(response.data));
    }
    return response.data;
};

// Transaction Endpoints
export const getTransactions = async () => {
    const response = await api.get('/api/transactions/my');
    return response.data;
};

export const createTransaction = async (receiverEmail, amount, type, description = '') => {
    const response = await api.post('/api/transactions', {
        receiverEmail,
        amount,
        type,
        description
    });
    return response.data;
};

// Credit Score Endpoint
export const getCreditScore = async () => {
    const response = await api.get('/api/credit-score/my');
    return response.data;
};

// Money Request Endpoints
export const getMoneyRequests = async () => {
    const response = await api.get('/api/requests/my');
    return response.data;
};

export const createMoneyRequest = async (receiverEmail, amount, notes = '') => {
    const response = await api.post('/api/requests', {
        receiverEmail,
        amount,
        notes
    });
    return response.data;
};

export const acceptMoneyRequest = async (requestId) => {
    const response = await api.post(`/api/requests/${requestId}/accept`);
    return response.data;
};

export const rejectMoneyRequest = async (requestId) => {
    const response = await api.post(`/api/requests/${requestId}/reject`);
    return response.data;
};

export default api;