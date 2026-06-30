export const API_ROUTES = {
  PROFILE: "/profile",
  PROFILE_RESUME_DOWNLOAD: "/profile/resume/download",

  PROJECTS: "/projects",
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,

  EXPERIENCE: "/experience",
  EDUCATION: "/education",
  CERTIFICATIONS: "/certifications",
  SKILLS: "/skills",

  CONTACT: "/contact",
  JD_MATCH: "/jd-match",
  SETTINGS: "/settings",
  ANALYTICS_EVENTS: "/analytics/events",

  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD_STATS: "/admin/dashboard/stats",

  ADMIN_PROFILE: "/admin/profile",
  ADMIN_PROFILE_RESUME: "/admin/profile/resume",

  ADMIN_SETTINGS: "/admin/settings",

  ADMIN_PROJECTS: "/admin/projects",
  ADMIN_PROJECT_DETAIL: (id: string) => `/admin/projects/${id}`,

  ADMIN_EXPERIENCE: "/admin/experience",
  ADMIN_EXPERIENCE_DETAIL: (id: string) => `/admin/experience/${id}`,

  ADMIN_EDUCATION: "/admin/education",
  ADMIN_EDUCATION_DETAIL: (id: string) => `/admin/education/${id}`,

  ADMIN_CERTIFICATIONS: "/admin/certifications",
  ADMIN_CERTIFICATION_DETAIL: (id: string) => `/admin/certifications/${id}`,

  ADMIN_SKILLS: "/admin/skills",
  ADMIN_SKILL_DETAIL: (id: string) => `/admin/skills/${id}`,

  ADMIN_JD_QUERIES: "/admin/jd-queries",
  ADMIN_JD_QUERY_DETAIL: (id: string) => `/admin/jd-queries/${id}`,
  ADMIN_JD_QUERIES_EXPORT: "/admin/jd-queries/export",

  ADMIN_CONTACT_LEADS: "/admin/contact-leads",
  ADMIN_CONTACT_LEAD_DETAIL: (id: string) => `/admin/contact-leads/${id}`,
  ADMIN_CONTACT_LEADS_EXPORT: '/admin/contact-leads/export',

  METADATA_ENUMS: '/metadata/enums',
} as const;
