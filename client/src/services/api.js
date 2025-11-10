import axios from 'axios';

const API_URL = 'http://localhost:5001';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to request headers if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API Request:', config.method?.toUpperCase(), config.url, {
            headers: config.headers,
            hasToken: !!token
        });
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for better error handling
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', response.status, response.config.url, {
            dataLength: response.data?.length || 'N/A',
            hasData: !!response.data
        });
        return response;
    },
    (error) => {
        console.error('API Error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            url: error.config?.url
        });

        // Handle 401 errors by redirecting to login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// Auth endpoints
export const loginUser = async (email, password) => {
    try {
        console.log('=== API.JS LOGIN START ===');
        console.log('About to make POST request to /api/auth/login');
        console.log('Email:', email);
        console.log('Password length:', password?.length);

        const response = await api.post('/api/auth/login', { email, password });

        console.log('=== API.JS LOGIN SUCCESS ===');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);

        console.log('Login API call successful, returning response to LoginPage');
        return response;
    } catch (error) {
        console.error('=== API.JS LOGIN ERROR ===');
        console.error('Error type:', typeof error);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        console.error('Full error:', error);
        throw error;
    }
};

export const registerUser = async (name, email, password, confirmPassword, phone = '') => {
    try {
        const response = await api.post('/api/auth/register', {
            fullName: name,
            email,
            password,
            confirmPassword,
            phone
        });

        if (response.data) {
            const userData = {
                ...response.data.user,
                balance: response.data.user.balance || 10000
            };
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userData', JSON.stringify(userData));
            response.data.user = userData;
        }

        return response;
    } catch (error) {
        console.error('Registration failed:', error.response?.data || error.message);
        throw error;
    }
};

// User Profile API calls
export const getUserProfile = async () => {
    try {
        const response = await api.get('/users/profile');
        // Update local storage with latest user data
        if (response.data) {
            localStorage.setItem('userData', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        console.error('Get profile failed:', error.response?.data || error.message);
        throw error;
    }
};

export const updateUserProfile = async (userData) => {
    try {
        const response = await api.put('/users/profile', userData);
        return response.data;
    } catch (error) {
        console.error('Update profile error:', error.response?.data || error.message);
        throw error;
    }
};

// Transaction API calls
export const getTransactions = async () => {
    try {
        const response = await api.get('/transactions/my');
        return response.data;
    } catch (error) {
        console.error('Get transactions failed:', error.response?.data || error.message);
        throw error;
    }
};

// Admin functions
export const updateAllBalances = async () => {
    try {
        const response = await api.post('/api/admin/update-default-balance');
        return response.data;
    } catch (error) {
        console.error('Update balances failed:', error.response?.data || error.message);
        throw error;
    }
};

export const createTransaction = async (receiverId, amount, type, description = '') => {
    try {
        const response = await api.post('/transactions', {
            receiverId,
            amount,
            type,
            description
        });
        return response.data;
    } catch (error) {
        console.error('Create transaction failed:', error.response?.data || error.message);
        throw error;
    }
};

// Get live credit score based on transactions
export const getCreditScore = async (userId) => {
    try {
        const response = await api.get(`/api/credit-score/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching credit score:', error.response?.data || error.message);
        throw error;
    }
};

// Export the api instance as default
export default api;