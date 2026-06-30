import { Outlet, Link, useNavigate, Navigate, useLocation } from "react-router-dom"
import { ROUTES, STORAGE_KEYS } from "@/constants"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function AdminLayout() {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

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
    { name: "Settings", path: ROUTES.ADMIN_SETTINGS },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between border-b bg-muted/40 p-4">
        <div className="font-bold text-xl">Admin Panel</div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger render={
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          }>
            <span className="sr-only">Toggle Menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4 flex flex-col gap-4">
            <SheetTitle className="font-bold text-xl mb-4">Admin Panel</SheetTitle>
            <nav className="flex flex-col gap-2 text-sm">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`p-3 rounded hover:bg-muted ${location.pathname === link.path ? 'bg-muted font-medium' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="mt-auto">
              <Button variant="outline" className="w-full" onClick={handleLogout}>Logout</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 border-r bg-muted/40 p-4 flex-col gap-4 sticky top-0 h-screen overflow-y-auto">
        <div className="font-bold text-xl mb-4">Admin Panel</div>
        <nav className="flex flex-col gap-2 text-sm">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`p-2 rounded hover:bg-muted ${location.pathname === link.path ? 'bg-muted font-medium' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Button variant="outline" className="w-full" onClick={handleLogout}>Logout</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-background overflow-x-hidden min-h-[calc(100vh-65px)] md:min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
