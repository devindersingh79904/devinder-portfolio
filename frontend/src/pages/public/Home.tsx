import { useQuery } from '@tanstack/react-query'
import { apiClient, getResumeDownloadUrl } from '@/services/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { API_ROUTES } from '@/constants/apiRoutes'
import { ROUTES } from '@/constants/routes'
import { QUERY_KEYS } from '@/constants'
import { trackEvent } from '@/services/analytics'
import { ANALYTICS_EVENTS } from '@/constants/analyticsEvents'

export function Home() {
  const { data: profileResp, isLoading: isProfileLoading } = useQuery({
    queryKey: QUERY_KEYS.PUBLIC_PROFILE,
    queryFn: () => apiClient.get(API_ROUTES.PROFILE)
  })

  const { data: projectsResp } = useQuery({
    queryKey: QUERY_KEYS.PUBLIC_PROJECTS,
    queryFn: () => apiClient.get(API_ROUTES.PROJECTS)
  })

  const profile = profileResp?.data
  const projects = projectsResp?.data || []

  if (isProfileLoading) return <div className="p-8 text-center">Loading profile...</div>

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-12">
      <Helmet>
        <title>{profile?.fullName || 'Portfolio'} - Home</title>
        <meta name="description" content={profile?.summary || 'Personal portfolio website'} />
      </Helmet>

      {/* Hero Section */}
      <section className="text-center space-y-4 py-12 sm:py-20 bg-muted/30 rounded-xl px-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{profile?.fullName || 'Your Name'}</h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">{profile?.headline || 'Your Title'}</p>
        <p className="max-w-3xl mx-auto text-base sm:text-lg">{profile?.summary}</p>
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          {profile?.resumeUrl && (
            <Button asChild size="lg">
              <a href={getResumeDownloadUrl()} target="_blank" rel="noreferrer">
                Download Resume
              </a>
            </Button>
          )}
          <Button variant="outline" size="lg" asChild>
            <Link to={ROUTES.CONTACT}>Contact Me</Link>
          </Button>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter((p: any) => p.isFeatured).map((p: any) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription className="line-clamp-3">{p.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {p.techStack.map((tech: string) => (
                      <span key={tech} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">{tech}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="default" className="p-0 px-4" asChild>
                    <Link
                      to={ROUTES.PROJECT_DETAIL_BUILD(p.id)}
                      onClick={() => trackEvent(ANALYTICS_EVENTS.PROJECT_CLICKED, undefined, { projectId: p.id, title: p.title })}
                    >
                      View Details
                    </Link>
                  </Button>
                  {p.liveUrl && (
                    <Button variant="link" className="p-0" asChild>
                      <a href={p.liveUrl} target="_blank" rel="noreferrer">Live Demo &rarr;</a>
                    </Button>
                  )}
                  {p.githubUrl && (
                    <Button variant="link" className="p-0 text-muted-foreground" asChild>
                      <a href={p.githubUrl} target="_blank" rel="noreferrer">GitHub</a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {projects.filter((p: any) => p.isFeatured).length === 0 && (
            <p className="text-muted-foreground">No featured projects found.</p>
          )}
        </div>
      </section>
    </div>
  )
}
