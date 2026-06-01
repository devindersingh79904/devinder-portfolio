import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ROUTES } from "@/constants"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"
import { Toaster } from "sonner"

import { Home } from "@/pages/public/Home"
import { JDMatch } from "@/pages/public/JDMatch"
import { Contact } from "@/pages/public/Contact"
import { PublicProjects } from "@/pages/public/Projects"
import { PublicExperience } from "@/pages/public/Experience"
import { PublicCertifications } from "@/pages/public/Certifications"

import { AdminLogin } from "@/pages/admin/Login"
import { AdminDashboard } from "@/pages/admin/Dashboard"
import { AdminProfile } from "@/pages/admin/Profile"
import { GenericCrud } from "@/pages/admin/GenericCrud"



function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.PROJECTS} element={<PublicProjects />} />
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
            endpoint="/projects" 
            columns={[{key: 'title', label: 'Title'}, {key: 'is_featured', label: 'Featured'}]} 
            fields={[
              {key: 'title', label: 'Title', type: 'text', required: true}, 
              {key: 'short_description', label: 'Short Description', type: 'text'}, 
              {key: 'detailed_description', label: 'Detailed Description', type: 'textarea'},
              {key: 'problem_solved', label: 'Problem Solved', type: 'textarea'},
              {key: 'tech_stack', label: 'Tech Stack (comma-separated)', type: 'array'},
              {key: 'features', label: 'Features (comma-separated)', type: 'array'},
              {key: 'github_url', label: 'GitHub URL', type: 'text'},
              {key: 'live_url', label: 'Live URL', type: 'text'},
              {key: 'demo_url', label: 'Demo URL', type: 'text'},
              {key: 'architecture_url', label: 'Architecture URL', type: 'text'},
              {key: 'display_order', label: 'Display Order', type: 'number'},
              {key: 'is_featured', label: 'Is Featured', type: 'boolean'},
              {key: 'is_active', label: 'Is Active', type: 'boolean'}
            ]} 
          />} />
          <Route path={ROUTES.ADMIN_EXPERIENCE} element={<GenericCrud entityName="Experience" endpoint="/experience" columns={[{key: 'company_name', label: 'Company'}, {key: 'role', label: 'Role'}]} fields={[{key: 'company_name', label: 'Company', type: 'text'}, {key: 'role', label: 'Role', type: 'text'}, {key: 'start_date', label: 'Start Date', type: 'date'}]} />} />
          <Route path={ROUTES.ADMIN_EDUCATION} element={<GenericCrud entityName="Education" endpoint="/education" columns={[{key: 'degree', label: 'Degree'}, {key: 'institution_name', label: 'Institution'}]} fields={[{key: 'institution_name', label: 'Institution', type: 'text'}, {key: 'degree', label: 'Degree', type: 'text'}]} />} />
          <Route path={ROUTES.ADMIN_CERTIFICATIONS} element={<GenericCrud entityName="Certifications" endpoint="/certifications" columns={[{key: 'title', label: 'Name'}, {key: 'issuer', label: 'Issuer'}]} fields={[{key: 'title', label: 'Title', type: 'text'}, {key: 'issuer', label: 'Issuer', type: 'text'}]} />} />
          <Route path={ROUTES.ADMIN_SKILLS} element={<GenericCrud entityName="Skills" endpoint="/skills" columns={[{key: 'name', label: 'Name'}, {key: 'category', label: 'Category'}]} fields={[{key: 'name', label: 'Name', type: 'text'}, {key: 'category', label: 'Category', type: 'text'}, {key: 'proficiency', label: 'Proficiency (1-100)', type: 'number'}]} />} />
          <Route path={ROUTES.ADMIN_JD_QUERIES} element={<GenericCrud entityName="JD Queries" endpoint="/jd-queries" columns={[{key: 'hr_name', label: 'HR'}, {key: 'jd_text', label: 'Query'}, {key: 'match_score', label: 'Match Score'}]} readOnly={true} />} />
          <Route path={ROUTES.ADMIN_CONTACT_LEADS} element={<GenericCrud entityName="Contact Leads" endpoint="/contact-leads" columns={[{key: 'name', label: 'Name'}, {key: 'email', label: 'Email'}, {key: 'subject', label: 'Subject'}]} readOnly={true} />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
