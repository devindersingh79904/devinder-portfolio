import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS, ROUTES } from '../constants';
import { API_ROUTES } from '../constants/apiRoutes';
import { v4 as uuidv4 } from 'uuid';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getResumeDownloadUrl = () => {
    return `${API_BASE_URL}${API_ROUTES.PROFILE_RESUME_DOWNLOAD}`;
};

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
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== ROUTES.ADMIN_LOGIN) {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            window.location.href = ROUTES.ADMIN_LOGIN;
        }
    }
    
    // Extract standardized error format
    const formattedError = error.response?.data?.message || error.response?.data?.detail || 'An unexpected error occurred';
    return Promise.reject(new Error(formattedError));
});
