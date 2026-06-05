export const QUERY_KEYS = {
  DASHBOARD_STATS: ['dashboard_stats'] as const,
  ADMIN_PROFILE: ['admin_profile'] as const,
  PUBLIC_PROFILE: ['public_profile'] as const,
  
  PROJECTS: ['projects'] as const,
  PUBLIC_PROJECTS: ['public_projects'] as const,
  PROJECT_DETAIL: (id: string) => ['project_detail', id] as const,
  
  EXPERIENCE: ['experience'] as const,
  PUBLIC_EXPERIENCE: ['public_experience'] as const,
  
  EDUCATION: ['education'] as const,
  
  CERTIFICATIONS: ['certifications'] as const,
  PUBLIC_CERTS: ['public_certs'] as const,
  
  SKILLS: ['skills'] as const,
  
  JD_QUERIES: ['jd_queries'] as const,
  CONTACT_LEADS: ['contact_leads'] as const,
  
  METADATA_ENUMS: ['metadata', 'enums'] as const,

  GENERIC_CRUD_LIST: (endpoint: string, page: number, size: number) => [endpoint, page, size] as const,
  GENERIC_CRUD: (endpoint: string) => [endpoint] as const,
};
