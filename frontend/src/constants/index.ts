export { API_ROUTES } from './apiRoutes';
export { ROUTES } from './routes';
export { MESSAGES } from './messages';
export { QUERY_KEYS } from './queryKeys';
export { ANALYTICS_EVENTS } from './analyticsEvents';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'portfolio_admin_token',
};
