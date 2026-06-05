import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Helmet } from 'react-helmet-async'
import { API_ROUTES } from '@/constants'
import { QUERY_KEYS } from '@/constants'

export function PublicCertifications() {
  const { data: certsResp, isLoading } = useQuery({
    queryKey: QUERY_KEYS.PUBLIC_CERTS,
    queryFn: () => apiClient.get(API_ROUTES.CERTIFICATIONS)
  })

  const certs = certsResp?.data || []

  if (isLoading) return <div className="p-8">Loading certifications...</div>

  return (
    <div className="container mx-auto p-8 space-y-8 max-w-4xl">
      <Helmet>
        <title>Certifications - Portfolio</title>
      </Helmet>
      <h1 className="text-4xl font-extrabold tracking-tight">Certifications & Awards</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certs.map((c: any) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-medium text-muted-foreground">{c.issuer}</div>
              {c.date_issued && <div className="text-sm mt-1">{new Date(c.date_issued).toLocaleDateString()}</div>}
              {c.link && (
                <a href={c.link} target="_blank" rel="noreferrer" className="text-primary text-sm mt-2 block hover:underline">
                  View Credential
                </a>
              )}
            </CardContent>
          </Card>
        ))}
        {certs.length === 0 && <p className="text-muted-foreground">No certifications listed.</p>}
      </div>
    </div>
  )
}
