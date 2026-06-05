import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ROUTES, API_ROUTES, QUERY_KEYS } from "@/constants"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Toaster } from "sonner"

import { Home } from "@/pages/public/Home"
import { JDMatch } from "@/pages/public/JDMatch"
import { Contact } from "@/pages/public/Contact"
import { PublicProjects } from "@/pages/public/Projects"
import { ProjectDetail } from "@/pages/public/ProjectDetail"
import { PublicExperience } from "@/pages/public/Experience"
import { PublicCertifications } from "@/pages/public/Certifications"

import { AdminLogin } from "@/pages/admin/Login"
import { AdminDashboard } from "@/pages/admin/Dashboard"
import { AdminProfile } from "@/pages/admin/Profile"
import { GenericCrud } from "@/pages/admin/GenericCrud"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/services/api"
import { SKILL_CATEGORIES, SKILL_PROFICIENCIES, CERTIFICATION_STATUSES } from "@/constants/enums"



function App() {
  const { data: enumsResp } = useQuery({
    queryKey: QUERY_KEYS.METADATA_ENUMS,
    queryFn: () => apiClient.get(API_ROUTES.METADATA_ENUMS),
    staleTime: Infinity
  })

  const enumsData = enumsResp?.data || {}
  const skillCategories = enumsData.skillCategories || SKILL_CATEGORIES
  const skillProficiencies = enumsData.skillProficiencies || SKILL_PROFICIENCIES
  const certStatuses = enumsData.certificationStatuses || CERTIFICATION_STATUSES

  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.PROJECTS} element={<PublicProjects />} />
          <Route path={ROUTES.PROJECT_DETAIL} element={<ProjectDetail />} />
          <Route path={ROUTES.EXPERIENCE} element={<PublicExperience />} />
          <Route path={ROUTES.CERTIFICATIONS} element={<PublicCertifications />} />
          <Route path={ROUTES.JD_MATCH} element={<JDMatch />} />
          <Route path={ROUTES.CONTACT} element={<Contact />} />
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
          <Route path={ROUTES.ADMIN_EXPERIENCE} element={<GenericCrud entityName="Experience" endpoint={API_ROUTES.ADMIN_EXPERIENCE} columns={[{key: 'companyName', label: 'Company'}, {key: 'role', label: 'Role'}]} fields={[{key: 'companyName', label: 'Company', type: 'text'}, {key: 'role', label: 'Role', type: 'text'}, {key: 'startDate', label: 'Start Date', type: 'date'}]} />} />
          <Route path={ROUTES.ADMIN_EDUCATION} element={<GenericCrud entityName="Education" endpoint={API_ROUTES.ADMIN_EDUCATION} columns={[{key: 'degree', label: 'Degree'}, {key: 'institutionName', label: 'Institution'}]} fields={[{key: 'institutionName', label: 'Institution', type: 'text'}, {key: 'degree', label: 'Degree', type: 'text'}]} />} />
          <Route path={ROUTES.ADMIN_CERTIFICATIONS} element={<GenericCrud entityName="Certifications" endpoint={API_ROUTES.ADMIN_CERTIFICATIONS} columns={[{key: 'title', label: 'Name'}, {key: 'issuer', label: 'Issuer'}]} fields={[{key: 'title', label: 'Title', type: 'text', required: true}, {key: 'issuer', label: 'Issuer', type: 'text', required: true}, {key: 'issueDate', label: 'Issue Date', type: 'date', required: true}, {key: 'expiryDate', label: 'Expiry Date', type: 'date'}, {key: 'credentialId', label: 'Credential ID', type: 'text'}, {key: 'credentialUrl', label: 'Credential URL', type: 'text'}, {key: 'status', label: 'Status', type: 'select', options: certStatuses as string[]}]} />} />
          <Route path={ROUTES.ADMIN_SKILLS} element={<GenericCrud entityName="Skills" endpoint={API_ROUTES.ADMIN_SKILLS} columns={[{key: 'name', label: 'Name'}, {key: 'category', label: 'Category'}, {key: 'proficiency', label: 'Proficiency'}]} fields={[{key: 'name', label: 'Name', type: 'text', required: true}, {key: 'category', label: 'Category', type: 'select', options: skillCategories as string[], required: true}, {key: 'proficiency', label: 'Proficiency', type: 'select', options: skillProficiencies as string[], required: true}]} />} />
          <Route path={ROUTES.ADMIN_JD_QUERIES} element={<GenericCrud entityName="JD Queries" endpoint={API_ROUTES.ADMIN_JD_QUERIES} columns={[{key: 'hr_name', label: 'HR'}, {key: 'jd_text', label: 'Query'}, {key: 'match_score', label: 'Match Score'}]} readOnly={true} />} />
          <Route path={ROUTES.ADMIN_CONTACT_LEADS} element={<GenericCrud entityName="Contact Leads" endpoint={API_ROUTES.ADMIN_CONTACT_LEADS} columns={[{key: 'name', label: 'Name'}, {key: 'email', label: 'Email'}, {key: 'subject', label: 'Subject'}]} readOnly={true} />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
