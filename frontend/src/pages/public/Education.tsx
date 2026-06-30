import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Helmet } from 'react-helmet-async'
import { LoadError } from '@/components/LoadError'
import { API_ROUTES, QUERY_KEYS } from '@/constants'

export function PublicEducation() {
  const { data: eduResp, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.PUBLIC_EDUCATION,
    queryFn: () => apiClient.get(API_ROUTES.EDUCATION)
  })

  const education = eduResp?.data || []

  if (isLoading) return <div className="p-8">Loading education...</div>
  if (isError) return <LoadError message="Couldn't load education." onRetry={() => refetch()} />

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-8 max-w-4xl">
      <Helmet>
        <title>Education - Portfolio</title>
      </Helmet>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Education</h1>
      <div className="space-y-6">
        {education.map((e: any) => (
          <Card key={e.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <CardTitle className="text-xl sm:text-2xl">{e.degree}</CardTitle>
                  <CardDescription className="text-base sm:text-lg font-medium">
                    {e.institutionName}{e.fieldOfStudy ? ` · ${e.fieldOfStudy}` : ''}
                  </CardDescription>
                </div>
                <div className="text-muted-foreground text-sm sm:text-right shrink-0">
                  {e.startYear || ''}{e.startYear && e.endYear ? ' - ' : ''}{e.endYear || ''}
                  {e.grade && <div className="mt-1">Grade: {e.grade}</div>}
                </div>
              </div>
            </CardHeader>
            {e.description && (
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{e.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
        {education.length === 0 && <p className="text-muted-foreground">No education listed.</p>}
      </div>
    </div>
  )
}
