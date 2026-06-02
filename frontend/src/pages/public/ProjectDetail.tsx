import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { API_ROUTES, ROUTES } from '@/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ExternalLink, MonitorPlay } from 'lucide-react'
import { QUERY_KEYS } from '@/constants'

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data: response, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.PROJECT_DETAIL, projectId],
    queryFn: () => apiClient.get(API_ROUTES.PROJECT_DETAIL(projectId as string)),
    enabled: !!projectId
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading project details...</div>
  }

  if (isError || !response?.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Project Not Found</h2>
        <Button asChild>
          <Link 
            to={ROUTES.PROJECTS}
          >
            Back to Projects
          </Link>
        </Button>
      </div>
    )
  }

  const project = response.data

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8 animate-in fade-in zoom-in duration-500">
      <Link to={ROUTES.PROJECTS} className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all projects
      </Link>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{project.title}</h1>
          {project.isFeatured && (
            <Badge variant="default" className="text-sm px-3 py-1">Featured</Badge>
          )}
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed">
          {project.shortDescription}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 pt-4 border-t">
        {project.liveUrl && (
          <Button asChild>
            <a href={project.liveUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Live Project
            </a>
          </Button>
        )}
        {project.githubUrl && (
          <Button variant="outline" asChild>
            <a href={project.githubUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Source Code
            </a>
          </Button>
        )}
        {project.demoUrl && (
          <Button variant="outline" asChild>
            <a href={project.demoUrl} target="_blank" rel="noreferrer">
              <MonitorPlay className="mr-2 h-4 w-4" />
              Video Demo
            </a>
          </Button>
        )}
        {project.architectureUrl && (
          <Button variant="secondary" asChild>
            <a href={project.architectureUrl} target="_blank" rel="noreferrer">
              Architecture Diagram
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">About the Project</h2>
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <p className="leading-7 whitespace-pre-wrap">
                  {project.detailedDescription || "No detailed description provided."}
                </p>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Problem Solved</h2>
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur">
              <CardContent className="pt-6">
                <p className="leading-7 whitespace-pre-wrap">
                  {project.problemSolved || "No problem statement provided."}
                </p>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="space-y-8">
          {project.techStack && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(project.techStack) ? project.techStack.map((tech: string, i: number) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1 font-medium">{tech}</Badge>
                )) : Object.entries(project.techStack).map(([category, techs]: any) => (
                  <div key={category} className="w-full space-y-2">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">{category}</span>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(techs) ? techs.map((t, i) => (
                        <Badge key={i} variant="secondary">{t}</Badge>
                      )) : <Badge variant="secondary">{techs}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {project.features && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">Key Features</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                {Array.isArray(project.features) ? project.features.map((feature: string, i: number) => (
                  <li key={i}>{feature}</li>
                )) : Object.values(project.features).map((feature: any, i: number) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
