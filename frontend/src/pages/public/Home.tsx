import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Helmet } from 'react-helmet-async'

export function Home() {
  const { data: profileResp, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get('/profile')
  })

  const { data: projectsResp } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get('/projects')
  })

  const profile = profileResp?.data
  const projects = projectsResp?.data || []

  if (isProfileLoading) return <div className="p-8 text-center">Loading profile...</div>

  return (
    <div className="container mx-auto p-8 space-y-12">
      <Helmet>
        <title>{profile?.name || 'Portfolio'} - Home</title>
        <meta name="description" content={profile?.bio || 'Personal portfolio website'} />
      </Helmet>

      {/* Hero Section */}
      <section className="text-center space-y-4 py-20 bg-muted/30 rounded-xl">
        <h1 className="text-5xl font-extrabold tracking-tight">{profile?.name || 'Your Name'}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{profile?.title || 'Your Title'}</p>
        <p className="max-w-3xl mx-auto text-lg">{profile?.bio}</p>
        <div className="pt-4 flex justify-center gap-4">
          {profile?.resume_url && (
            <Button asChild size="lg">
              <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/profile/resume/download`} target="_blank" rel="noreferrer">
                Download Resume
              </a>
            </Button>
          )}
          <Button variant="outline" size="lg" asChild>
            <a href="/contact">Contact Me</a>
          </Button>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter((p: any) => p.is_featured).map((p: any) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription className="line-clamp-3">{p.description}</CardDescription>
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
          {projects.filter((p: any) => p.is_featured).length === 0 && (
            <p className="text-muted-foreground">No featured projects found.</p>
          )}
        </div>
      </section>
    </div>
  )
}
