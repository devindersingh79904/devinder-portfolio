import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Helmet } from 'react-helmet-async'

export function PublicProjects() {
  const { data: projectsResp, isLoading } = useQuery({
    queryKey: ['public-projects'],
    queryFn: () => apiClient.get('/projects')
  })

  const projects = projectsResp?.data || []

  if (isLoading) return <div className="p-8">Loading projects...</div>

  return (
    <div className="container mx-auto p-8 space-y-8">
      <Helmet>
        <title>Projects - Portfolio</title>
      </Helmet>
      <h1 className="text-4xl font-extrabold tracking-tight">All Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p: any) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {p.link && (
                <Button variant="link" className="p-0" asChild>
                  <a href={p.link} target="_blank" rel="noreferrer">View Project &rarr;</a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && <p className="text-muted-foreground">No projects found.</p>}
      </div>
    </div>
  )
}
