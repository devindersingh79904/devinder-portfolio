import { useState, useEffect } from "react"
import { Outlet, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ROUTES, APP_NAME, API_ROUTES, QUERY_KEYS } from "@/constants"
import { apiClient } from "@/services/api"
import { Menu, X } from "lucide-react"
import { usePageViewTracker, setAnalyticsEnabled } from "@/services/analytics"

export function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  usePageViewTracker()

  const { data: settingsResp } = useQuery({
    queryKey: QUERY_KEYS.PUBLIC_SETTINGS,
    queryFn: () => apiClient.get(API_ROUTES.SETTINGS),
  })
  const s = settingsResp?.data || {}
  const on = (flag: string) => s[flag] ?? true

  useEffect(() => {
    if (settingsResp?.data) setAnalyticsEnabled(settingsResp.data.analyticsEnabled ?? true)
  }, [settingsResp])

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const close = () => setIsMobileMenuOpen(false)
  const NavLinks = () => (
    <>
      <Link to={ROUTES.HOME} onClick={close} className="transition-colors hover:text-foreground/80">Home</Link>
      {on('projectsEnabled') && <Link to={ROUTES.PROJECTS} onClick={close} className="transition-colors hover:text-foreground/80">Projects</Link>}
      {on('experienceEnabled') && <Link to={ROUTES.EXPERIENCE} onClick={close} className="transition-colors hover:text-foreground/80">Experience</Link>}
      {on('skillsEnabled') && <Link to={ROUTES.SKILLS} onClick={close} className="transition-colors hover:text-foreground/80">Skills</Link>}
      {on('educationEnabled') && <Link to={ROUTES.EDUCATION} onClick={close} className="transition-colors hover:text-foreground/80">Education</Link>}
      {on('certificationsEnabled') && <Link to={ROUTES.CERTIFICATIONS} onClick={close} className="transition-colors hover:text-foreground/80">Certifications</Link>}
      {on('jdMatchEnabled') && (
        <Link to={ROUTES.JD_MATCH} onClick={close} className="transition-colors hover:text-foreground/80 text-primary font-bold">JD Match</Link>
      )}
      {on('contactEnabled') && <Link to={ROUTES.CONTACT} onClick={close} className="transition-colors hover:text-foreground/80">Contact</Link>}
    </>
  )

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to={ROUTES.HOME} className="font-bold text-xl">{APP_NAME}</Link>
          
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-5 text-sm font-medium">
            <NavLinks />
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2" onClick={toggleMenu} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-background px-4 py-4 space-y-4 flex flex-col text-sm font-medium shadow-md">
            <NavLinks />
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex h-14 items-center justify-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
