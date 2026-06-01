import { Outlet, Link, useNavigate, Navigate } from "react-router-dom"
import { ROUTES, STORAGE_KEYS } from "@/constants"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function AdminLayout() {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!token) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    navigate(ROUTES.ADMIN_LOGIN)
  }

  const navLinks = [
    { name: "Dashboard", path: ROUTES.ADMIN_DASHBOARD },
    { name: "Profile & Resume", path: ROUTES.ADMIN_PROFILE },
    { name: "Projects", path: ROUTES.ADMIN_PROJECTS },
    { name: "Experience", path: ROUTES.ADMIN_EXPERIENCE },
    { name: "Education", path: ROUTES.ADMIN_EDUCATION },
    { name: "Certifications", path: ROUTES.ADMIN_CERTIFICATIONS },
    { name: "Skills", path: ROUTES.ADMIN_SKILLS },
    { name: "JD Queries", path: ROUTES.ADMIN_JD_QUERIES },
    { name: "Contact Leads", path: ROUTES.ADMIN_CONTACT_LEADS },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between border-b bg-muted/40 p-4">
        <div className="font-bold text-xl">Admin Panel</div>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 border-r bg-muted/40 p-4 flex-col gap-4 sticky top-0 h-screen overflow-y-auto">
        <div className="font-bold text-xl mb-4">Admin Panel</div>
        <nav className="flex flex-col gap-2 text-sm">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="p-2 hover:bg-muted rounded">
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Button variant="outline" className="w-full" onClick={handleLogout}>Logout</Button>
        </div>
      </aside>

      {/* Sidebar - Mobile Dropdown (Simple implementation) */}
      {mobileMenuOpen && (
        <aside className="md:hidden flex flex-col gap-4 border-b bg-background p-4 absolute w-full z-50">
          <nav className="flex flex-col gap-2 text-sm">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className="p-3 bg-muted/30 hover:bg-muted rounded">
                {link.name}
              </Link>
            ))}
          </nav>
          <Button variant="outline" className="w-full mt-4" onClick={handleLogout}>Logout</Button>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-background overflow-x-hidden min-h-[calc(100vh-65px)] md:min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
