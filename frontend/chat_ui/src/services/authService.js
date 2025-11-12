import axios from 'axios';

const AUTH_API_URL = 'http://localhost:8000/api/auth'

// Authentication functions
export const login = async (email,password) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/login`, {
            email,
            password
        });
        const { access_token } = response.data;
        localStorage.setItem('authToken', access_token);
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const register = async (email, password, username) => {
    try {
        const response = await axios.post(`${AUTH_API_URL}/register`, {
            email,
            password,
            username
        });
        const { access_token } = response.data;
        localStorage.setItem('authToken', access_token);
        return response.data;
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login'
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
};

export const getAuthToken = () => {
    return localStorage.getItem('authToken');
}

export const getUserInfo = async () => {
    try {
        const token = getAuthToken();
        if (!token) {
            throw new Error('No authentication token');
        }
        
        const response = await axios.get(`${AUTH_API_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting user info:', error);
        throw error;
    }
};