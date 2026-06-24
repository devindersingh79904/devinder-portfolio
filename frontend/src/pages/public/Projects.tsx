import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { API_ROUTES } from '@/constants/apiRoutes'
import { ROUTES } from '@/constants/routes'
import { QUERY_KEYS } from '@/constants'
import { trackEvent } from '@/services/analytics'
import { ANALYTICS_EVENTS } from '@/constants/analyticsEvents'

export function PublicProjects() {
  const { data: projectsResp, isLoading } = useQuery({
    queryKey: QUERY_KEYS.PUBLIC_PROJECTS,
    queryFn: () => apiClient.get(API_ROUTES.PROJECTS)
  })

  const projects = projectsResp?.data || []

  if (isLoading) return <div className="p-8">Loading projects...</div>

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-8">
      <Helmet>
        <title>Projects - Portfolio</title>
      </Helmet>
      <h1 className="text-4xl font-extrabold tracking-tight">All Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p: any) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
              <CardDescription>{p.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.isArray(p.techStack) && p.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {p.techStack.map((tech: string) => (
                      <span key={tech} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">{tech}</span>
                    ))}
                  </div>
              )}
              <div className="flex gap-4">
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
                {p.architectureUrl && (
                  <Button variant="link" className="p-0 text-muted-foreground" asChild>
                    <a href={p.architectureUrl} target="_blank" rel="noreferrer">Architecture</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && <p className="text-muted-foreground">No projects found.</p>}
      </div>
    </div>
  )
}
