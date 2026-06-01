export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const ROUTES = {
    HOME: '/',
    PROJECTS: '/projects',
    EXPERIENCE: '/experience',
    CERTIFICATIONS: '/certifications',
    JD_MATCH: '/jd-match',
    CONTACT: '/contact',
    
    ADMIN_LOGIN: '/admin/login',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_PROFILE: '/admin/profile',
    ADMIN_PROJECTS: '/admin/projects',
    ADMIN_EXPERIENCE: '/admin/experience',
    ADMIN_EDUCATION: '/admin/education',
    ADMIN_CERTIFICATIONS: '/admin/certifications',
    ADMIN_SKILLS: '/admin/skills',
    ADMIN_JD_QUERIES: '/admin/jd-queries',
    ADMIN_CONTACT_LEADS: '/admin/contact-leads',
};

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'portfolio_admin_token',
};
