import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';
import { v4 as uuidv4 } from 'uuid';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    // Add correlation ID
    if (!config.headers['X-Correlation-ID']) {
        config.headers['X-Correlation-ID'] = `UI-${uuidv4()}`;
    }
    
    // Add JWT Token if available
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
    return response.data; // we assume all responses follow APIResponse schema
}, (error) => {
    if (error.response && error.response.status === 401) {
        // Automatically logout on 401 if it's an admin route
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            window.location.href = '/admin/login';
        }
    }
    
    // Extract standardized error format
    const formattedError = error.response?.data?.message || 'An unexpected error occurred';
    return Promise.reject(new Error(formattedError));
});
