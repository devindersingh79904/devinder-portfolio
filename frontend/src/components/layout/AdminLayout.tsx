import { Outlet, Link, useNavigate, Navigate } from "react-router-dom"
import { ROUTES, STORAGE_KEYS } from "@/constants"
import { Button } from "@/components/ui/button"

export function AdminLayout() {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  const navigate = useNavigate()

  if (!token) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    navigate(ROUTES.ADMIN_LOGIN)
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col gap-4">
        <div className="font-bold text-xl mb-4">Admin Panel</div>
        <nav className="flex flex-col gap-2 text-sm">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="p-2 hover:bg-muted rounded">Dashboard</Link>
          <Link to={ROUTES.ADMIN_PROFILE} className="p-2 hover:bg-muted rounded">Profile & Resume</Link>
          <Link to={ROUTES.ADMIN_PROJECTS} className="p-2 hover:bg-muted rounded">Projects</Link>
          <Link to={ROUTES.ADMIN_EXPERIENCE} className="p-2 hover:bg-muted rounded">Experience</Link>
          <Link to={ROUTES.ADMIN_EDUCATION} className="p-2 hover:bg-muted rounded">Education</Link>
          <Link to={ROUTES.ADMIN_CERTIFICATIONS} className="p-2 hover:bg-muted rounded">Certifications</Link>
          <Link to={ROUTES.ADMIN_SKILLS} className="p-2 hover:bg-muted rounded">Skills</Link>
          <Link to={ROUTES.ADMIN_JD_QUERIES} className="p-2 hover:bg-muted rounded">JD Queries</Link>
          <Link to={ROUTES.ADMIN_CONTACT_LEADS} className="p-2 hover:bg-muted rounded">Contact Leads</Link>
        </nav>
        <div className="mt-auto">
          <Button variant="outline" className="w-full" onClick={handleLogout}>Logout</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-background">
        <Outlet />
      </main>
    </div>
  )
}
