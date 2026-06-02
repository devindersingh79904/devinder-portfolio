import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Helmet } from 'react-helmet-async'
import { API_ROUTES } from '@/constants'
import { QUERY_KEYS } from '@/constants'

export function PublicExperience() {
  const { data: expResp, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PUBLIC_EXPERIENCE],
    queryFn: () => apiClient.get(API_ROUTES.EXPERIENCE)
  })

  const experiences = expResp?.data || []

  if (isLoading) return <div className="p-8">Loading experience...</div>

  return (
    <div className="container mx-auto p-8 space-y-8 max-w-4xl">
      <Helmet>
        <title>Experience - Portfolio</title>
      </Helmet>
      <h1 className="text-4xl font-extrabold tracking-tight">Work Experience</h1>
      <div className="space-y-6">
        {experiences.map((e: any) => (
          <Card key={e.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{e.role}</CardTitle>
                  <CardDescription className="text-lg font-medium">{e.company}</CardDescription>
                </div>
                <div className="text-muted-foreground text-sm">
                  {new Date(e.start_date).toLocaleDateString()} - {e.end_date ? new Date(e.end_date).toLocaleDateString() : 'Present'}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{e.description}</p>
            </CardContent>
          </Card>
        ))}
        {experiences.length === 0 && <p className="text-muted-foreground">No experience listed.</p>}
      </div>
    </div>
  )
}
