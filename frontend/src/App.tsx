import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ROUTES, API_ROUTES, QUERY_KEYS } from "@/constants"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Toaster } from "sonner"
import { ErrorBoundary } from "@/components/ErrorBoundary"

// Route components are code-split so each page loads as its own chunk.
const Home = lazy(() => import("@/pages/public/Home").then(m => ({ default: m.Home })))
const JDMatch = lazy(() => import("@/pages/public/JDMatch").then(m => ({ default: m.JDMatch })))
const Contact = lazy(() => import("@/pages/public/Contact").then(m => ({ default: m.Contact })))
const PublicProjects = lazy(() => import("@/pages/public/Projects").then(m => ({ default: m.PublicProjects })))
const ProjectDetail = lazy(() => import("@/pages/public/ProjectDetail").then(m => ({ default: m.ProjectDetail })))
const PublicExperience = lazy(() => import("@/pages/public/Experience").then(m => ({ default: m.PublicExperience })))
const PublicEducation = lazy(() => import("@/pages/public/Education").then(m => ({ default: m.PublicEducation })))
const PublicSkills = lazy(() => import("@/pages/public/Skills").then(m => ({ default: m.PublicSkills })))
const PublicCertifications = lazy(() => import("@/pages/public/Certifications").then(m => ({ default: m.PublicCertifications })))
const NotFound = lazy(() => import("@/pages/NotFound").then(m => ({ default: m.NotFound })))

const AdminLogin = lazy(() => import("@/pages/admin/Login").then(m => ({ default: m.AdminLogin })))
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard").then(m => ({ default: m.AdminDashboard })))
const AdminProfile = lazy(() => import("@/pages/admin/Profile").then(m => ({ default: m.AdminProfile })))
const GenericCrud = lazy(() => import("@/pages/admin/GenericCrud").then(m => ({ default: m.GenericCrud })))

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/services/api"
import { SKILL_CATEGORIES, SKILL_PROFICIENCIES } from "@/constants/enums"

function PageLoader() {
  return <div className="p-8 text-muted-foreground">Loading…</div>
}



function App() {
  const { data: enumsResp } = useQuery({
    queryKey: QUERY_KEYS.METADATA_ENUMS,
    queryFn: () => apiClient.get(API_ROUTES.METADATA_ENUMS),
    staleTime: Infinity
  })

  const enumsData = enumsResp?.data || {}
  const skillCategories = enumsData.skillCategories || SKILL_CATEGORIES
  const skillProficiencies = enumsData.skillProficiencies || SKILL_PROFICIENCIES

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.PROJECTS} element={<PublicProjects />} />
          <Route path={ROUTES.PROJECT_DETAIL} element={<ProjectDetail />} />
          <Route path={ROUTES.EXPERIENCE} element={<PublicExperience />} />
          <Route path={ROUTES.EDUCATION} element={<PublicEducation />} />
          <Route path={ROUTES.SKILLS} element={<PublicSkills />} />
          <Route path={ROUTES.CERTIFICATIONS} element={<PublicCertifications />} />
          <Route path={ROUTES.JD_MATCH} element={<JDMatch />} />
          <Route path={ROUTES.CONTACT} element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Login */}
        <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />

        {/* Admin Protected Routes */}
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN_PROFILE} element={<AdminProfile />} />
          <Route path={ROUTES.ADMIN_PROJECTS} element={<GenericCrud 
            entityName="Projects" 
            endpoint={API_ROUTES.ADMIN_PROJECTS} 
            columns={[{key: 'title', label: 'Title'}, {key: 'isFeatured', label: 'Featured'}]} 
            fields={[
              {key: 'title', label: 'Title', type: 'text', required: true}, 
              {key: 'shortDescription', label: 'Short Description', type: 'text'}, 
              {key: 'detailedDescription', label: 'Detailed Description', type: 'textarea'},
              {key: 'problemSolved', label: 'Problem Solved', type: 'textarea'},
              {key: 'techStack', label: 'Tech Stack (comma-separated)', type: 'array'},
              {key: 'features', label: 'Features (comma-separated)', type: 'array'},
              {key: 'githubUrl', label: 'GitHub URL', type: 'text'},
              {key: 'liveUrl', label: 'Live URL', type: 'text'},
              {key: 'demoUrl', label: 'Demo URL', type: 'text'},
              {key: 'architectureUrl', label: 'Architecture URL', type: 'text'},
              {key: 'displayOrder', label: 'Display Order', type: 'number'},
              {key: 'isFeatured', label: 'Is Featured', type: 'boolean'},
              {key: 'isActive', label: 'Is Active', type: 'boolean'}
            ]} 
          />} />
          <Route path={ROUTES.ADMIN_EXPERIENCE} element={<GenericCrud
            entityName="Experience"
            endpoint={API_ROUTES.ADMIN_EXPERIENCE}
            columns={[{key: 'companyName', label: 'Company'}, {key: 'role', label: 'Role'}, {key: 'isCurrent', label: 'Current'}]}
            fields={[
              {key: 'companyName', label: 'Company', type: 'text', required: true},
              {key: 'role', label: 'Role', type: 'text', required: true},
              {key: 'location', label: 'Location', type: 'text'},
              {key: 'startDate', label: 'Start Date', type: 'date', required: true},
              {key: 'endDate', label: 'End Date', type: 'date'},
              {key: 'isCurrent', label: 'Currently Working Here', type: 'boolean'},
              {key: 'summary', label: 'Summary', type: 'textarea'},
              {key: 'techStack', label: 'Tech Stack (comma-separated)', type: 'array'},
              {key: 'achievements', label: 'Achievements (comma-separated)', type: 'array'},
              {key: 'displayOrder', label: 'Display Order', type: 'number'},
              {key: 'isActive', label: 'Is Active', type: 'boolean'}
            ]}
          />} />
          <Route path={ROUTES.ADMIN_EDUCATION} element={<GenericCrud
            entityName="Education"
            endpoint={API_ROUTES.ADMIN_EDUCATION}
            columns={[{key: 'degree', label: 'Degree'}, {key: 'institutionName', label: 'Institution'}]}
            fields={[
              {key: 'institutionName', label: 'Institution', type: 'text', required: true},
              {key: 'degree', label: 'Degree', type: 'text', required: true},
              {key: 'fieldOfStudy', label: 'Field of Study', type: 'text'},
              {key: 'startYear', label: 'Start Year', type: 'number'},
              {key: 'endYear', label: 'End Year', type: 'number'},
              {key: 'grade', label: 'Grade', type: 'text'},
              {key: 'description', label: 'Description', type: 'textarea'},
              {key: 'displayOrder', label: 'Display Order', type: 'number'},
              {key: 'isActive', label: 'Is Active', type: 'boolean'}
            ]}
          />} />
          <Route path={ROUTES.ADMIN_CERTIFICATIONS} element={<GenericCrud
            entityName="Certifications"
            endpoint={API_ROUTES.ADMIN_CERTIFICATIONS}
            columns={[{key: 'title', label: 'Name'}, {key: 'issuer', label: 'Issuer'}, {key: 'status', label: 'Status'}]}
            fields={[
              {key: 'title', label: 'Title', type: 'text', required: true},
              {key: 'issuer', label: 'Issuer', type: 'text', required: true},
              {key: 'issueDate', label: 'Issue Date', type: 'date'},
              {key: 'expiryDate', label: 'Expiry Date (leave blank if no expiry)', type: 'date'},
              {key: 'credentialId', label: 'Credential ID', type: 'text'},
              {key: 'credentialUrl', label: 'Credential URL', type: 'text'},
              {key: 'skills', label: 'Skills (comma-separated)', type: 'array'},
              {key: 'displayOrder', label: 'Display Order', type: 'number'},
              {key: 'isActive', label: 'Is Active', type: 'boolean'}
            ]}
          />} />
          <Route path={ROUTES.ADMIN_SKILLS} element={<GenericCrud
            entityName="Skills"
            endpoint={API_ROUTES.ADMIN_SKILLS}
            columns={[{key: 'name', label: 'Name'}, {key: 'category', label: 'Category'}, {key: 'proficiency', label: 'Proficiency'}]}
            fields={[
              {key: 'name', label: 'Name', type: 'text', required: true},
              {key: 'category', label: 'Category', type: 'select', options: skillCategories as string[], required: true},
              {key: 'proficiency', label: 'Proficiency', type: 'select', options: skillProficiencies as string[], required: true},
              {key: 'yearsOfExperience', label: 'Years of Experience', type: 'number'},
              {key: 'displayOrder', label: 'Display Order', type: 'number'},
              {key: 'isActive', label: 'Is Active', type: 'boolean'}
            ]}
          />} />
          <Route path={ROUTES.ADMIN_JD_QUERIES} element={<GenericCrud entityName="JD Queries" endpoint={API_ROUTES.ADMIN_JD_QUERIES} columns={[{key: 'hrName', label: 'HR'}, {key: 'companyName', label: 'Company'}, {key: 'jdText', label: 'Query'}, {key: 'matchScore', label: 'Match Score'}]} readOnly={true} exportEndpoint={API_ROUTES.ADMIN_JD_QUERIES_EXPORT} />} />
          <Route path={ROUTES.ADMIN_CONTACT_LEADS} element={<GenericCrud entityName="Contact Leads" endpoint={API_ROUTES.ADMIN_CONTACT_LEADS} columns={[{key: 'name', label: 'Name'}, {key: 'email', label: 'Email'}, {key: 'subject', label: 'Subject'}]} readOnly={true} exportEndpoint={API_ROUTES.ADMIN_CONTACT_LEADS_EXPORT} />} />
        </Route>
      </Routes>
        </Suspense>
    </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
