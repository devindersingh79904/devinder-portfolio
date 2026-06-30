import axios from 'axios';
import { API_BASE_URL, ROUTES } from '../constants';
import { API_ROUTES } from '../constants/apiRoutes';
import { v4 as uuidv4 } from 'uuid';
import { getAccessToken, setAccessToken, clearAccessToken } from './auth';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    // Send the httpOnly refresh cookie with requests (needed for /admin/refresh).
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Bare client used only for the refresh call, so it doesn't recurse through the
// apiClient response interceptor below.
const refreshClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

export const getResumeDownloadUrl = () => {
    return `${API_BASE_URL}${API_ROUTES.PROFILE_RESUME_DOWNLOAD}`;
};

// Attempt to mint a new access token from the refresh cookie. Returns true on success.
export const tryRefresh = async (): Promise<boolean> => {
    try {
        const resp = await refreshClient.post(API_ROUTES.ADMIN_REFRESH);
        const token = resp.data?.data?.access_token;
        if (token) {
            setAccessToken(token);
            return true;
        }
        return false;
    } catch {
        clearAccessToken();
        return false;
    }
};

// Download an authenticated file (e.g. CSV export) as a blob and trigger a save.
// Bypasses the JSON-unwrapping flow by requesting responseType 'blob'.
export const downloadFile = async (endpoint: string, filename: string) => {
    const blob: any = await apiClient.get(endpoint, { responseType: 'blob' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

apiClient.interceptors.request.use((config) => {
    // Add correlation ID
    if (!config.headers['X-Correlation-ID']) {
        config.headers['X-Correlation-ID'] = `UI-${uuidv4()}`;
    }

    // Attach the in-memory JWT access token if available
    const token = getAccessToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
    return response.data; // we assume all responses follow APIResponse schema
}, async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const url: string = original.url || '';
    const isAuthRoute = url.includes(API_ROUTES.ADMIN_REFRESH) || url.includes(API_ROUTES.ADMIN_LOGIN);

    // On a 401, try a one-shot refresh and replay the original request.
    if (status === 401 && !original._retry && !isAuthRoute) {
        original._retry = true;
        const refreshed = await tryRefresh();
        if (refreshed) {
            original.headers = original.headers || {};
            original.headers['Authorization'] = `Bearer ${getAccessToken()}`;
            return apiClient(original);
        }
        // Refresh failed: drop the session and bounce to login for admin routes.
        clearAccessToken();
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== ROUTES.ADMIN_LOGIN) {
            window.location.href = ROUTES.ADMIN_LOGIN;
        }
    }

    const formattedError = error.response?.data?.message || error.response?.data?.detail || 'An unexpected error occurred';
    return Promise.reject(new Error(formattedError));
});
