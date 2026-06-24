import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Helmet } from 'react-helmet-async'
import { API_ROUTES } from '@/constants'
import { QUERY_KEYS } from '@/constants'

export function PublicExperience() {
  const { data: expResp, isLoading } = useQuery({
    queryKey: QUERY_KEYS.PUBLIC_EXPERIENCE,
    queryFn: () => apiClient.get(API_ROUTES.EXPERIENCE)
  })

  const experiences = expResp?.data || []

  if (isLoading) return <div className="p-8">Loading experience...</div>

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-8 max-w-4xl">
      <Helmet>
        <title>Experience - Portfolio</title>
      </Helmet>
      <h1 className="text-4xl font-extrabold tracking-tight">Work Experience</h1>
      <div className="space-y-6">
        {experiences.map((e: any) => (
          <Card key={e.id}>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-2xl">{e.role}</CardTitle>
                  <CardDescription className="text-lg font-medium">
                    {e.companyName}{e.location ? ` · ${e.location}` : ''}
                  </CardDescription>
                </div>
                <div className="text-muted-foreground text-sm text-right shrink-0">
                  {new Date(e.startDate).toLocaleDateString()} - {e.isCurrent ? 'Present' : (e.endDate ? new Date(e.endDate).toLocaleDateString() : 'Present')}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {e.summary && <p className="whitespace-pre-wrap">{e.summary}</p>}
              {Array.isArray(e.achievements) && e.achievements.length > 0 && (
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {e.achievements.map((a: string, i: number) => <li key={i}>{a}</li>)}
                </ul>
              )}
              {Array.isArray(e.techStack) && e.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {e.techStack.map((tech: string) => (
                    <span key={tech} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">{tech}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {experiences.length === 0 && <p className="text-muted-foreground">No experience listed.</p>}
      </div>
    </div>
  )
}
