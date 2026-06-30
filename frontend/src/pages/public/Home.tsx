import { useQuery } from '@tanstack/react-query'
import { apiClient, getResumeDownloadUrl } from '@/services/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { LoadError } from '@/components/LoadError'
import { Seo } from '@/components/Seo'
import { Link } from 'react-router-dom'
import { API_ROUTES } from '@/constants/apiRoutes'
import { ROUTES } from '@/constants/routes'
import { QUERY_KEYS } from '@/constants'
import { trackEvent } from '@/services/analytics'
import { ANALYTICS_EVENTS } from '@/constants/analyticsEvents'
import type { Project, Profile } from '@/types'

export function Home() {
  const { data: profileResp, isLoading: isProfileLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.PUBLIC_PROFILE,
    queryFn: () => apiClient.get(API_ROUTES.PROFILE)
  })

  const { data: projectsResp } = useQuery({
    queryKey: QUERY_KEYS.PUBLIC_PROJECTS,
    queryFn: () => apiClient.get(API_ROUTES.PROJECTS)
  })

  const profile: Profile | undefined = (profileResp as any)?.data
  const projects: Project[] = (projectsResp as any)?.data || []
  const featured = projects.filter((p: Project) => p.isFeatured)

  if (isProfileLoading) return <div className="p-8 text-center">Loading profile...</div>
  if (isError) return <LoadError message="Couldn't load the portfolio. Is the API running?" onRetry={() => refetch()} />

  const jsonLd = profile && {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.fullName,
    jobTitle: profile.headline,
    email: profile.email,
    image: profile.profileImageUrl || undefined,
    sameAs: [profile.linkedinUrl, profile.githubUrl].filter(Boolean),
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-12">
      <Seo
        title={`${profile?.fullName || 'Portfolio'} - Home`}
        description={profile?.summary || 'Personal portfolio website'}
        image={profile?.profileImageUrl}
        jsonLd={jsonLd}
      />

      {/* Hero Section */}
      <section className="text-center space-y-4 py-12 sm:py-20 bg-muted/30 rounded-xl px-4">
        {(profile?.profileImageUrl || profile?.fullName) && (
          <div className="flex justify-center">
            <Avatar src={profile?.profileImageUrl} name={profile?.fullName} className="h-28 w-28" />
          </div>
        )}
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
          {featured.map((p: Project) => (
            <Card key={p.id} className="relative transition-shadow hover:shadow-lg">
              <CardHeader>
                {/* Stretched link: the title is the single real link; its overlay makes the whole card clickable. */}
                <CardTitle>
                  <Link
                    to={ROUTES.PROJECT_DETAIL_BUILD(p.id)}
                    onClick={() => trackEvent(ANALYTICS_EVENTS.PROJECT_CLICKED, undefined, { projectId: p.id, title: p.title })}
                    className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {p.title}
                  </Link>
                </CardTitle>
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
                {/* relative z-10 lifts these above the title's stretched overlay so they stay clickable */}
                <div className="relative z-10 flex gap-4">
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
          {featured.length === 0 && (
            <p className="text-muted-foreground">No featured projects found.</p>
          )}
        </div>
      </section>
    </div>
  )
}
