import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ROUTES } from "@/constants"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"

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
          <Route path={ROUTES.ADMIN_PROJECTS} element={<GenericCrud entityName="Projects" endpoint="/projects" columns={[{key: 'title', label: 'Title'}, {key: 'is_featured', label: 'Featured'}]} />} />
          <Route path={ROUTES.ADMIN_EXPERIENCE} element={<GenericCrud entityName="Experience" endpoint="/experience" columns={[{key: 'company', label: 'Company'}, {key: 'role', label: 'Role'}]} />} />
          <Route path={ROUTES.ADMIN_EDUCATION} element={<GenericCrud entityName="Education" endpoint="/education" columns={[{key: 'degree', label: 'Degree'}, {key: 'institution', label: 'Institution'}]} />} />
          <Route path={ROUTES.ADMIN_CERTIFICATIONS} element={<GenericCrud entityName="Certifications" endpoint="/certifications" columns={[{key: 'name', label: 'Name'}, {key: 'issuer', label: 'Issuer'}]} />} />
          <Route path={ROUTES.ADMIN_SKILLS} element={<GenericCrud entityName="Skills" endpoint="/skills" columns={[{key: 'name', label: 'Name'}, {key: 'category', label: 'Category'}]} />} />
          <Route path={ROUTES.ADMIN_JD_QUERIES} element={<GenericCrud entityName="JD Queries" endpoint="/jd-queries" columns={[{key: 'query_text', label: 'Query'}, {key: 'match_score', label: 'Match Score'}]} />} />
          <Route path={ROUTES.ADMIN_CONTACT_LEADS} element={<GenericCrud entityName="Contact Leads" endpoint="/contact-leads" columns={[{key: 'name', label: 'Name'}, {key: 'email', label: 'Email'}, {key: 'subject', label: 'Subject'}]} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
