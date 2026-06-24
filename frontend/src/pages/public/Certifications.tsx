import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
    <div className="container mx-auto p-4 sm:p-8 space-y-8 max-w-4xl">
      <Helmet>
        <title>Certifications - Portfolio</title>
      </Helmet>
      <h1 className="text-4xl font-extrabold tracking-tight">Certifications & Awards</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certs.map((c: any) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle>{c.title}</CardTitle>
                {c.status && (
                  <Badge variant={c.status === 'Expired' ? 'destructive' : 'secondary'}>{c.status}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-medium text-muted-foreground">{c.issuer}</div>
              {c.issueDate && <div className="text-sm mt-1">{new Date(c.issueDate).toLocaleDateString()}</div>}
              {Array.isArray(c.skills) && c.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {c.skills.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">{s}</span>
                  ))}
                </div>
              )}
              {c.credentialUrl && (
                <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="text-primary text-sm mt-3 block hover:underline">
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
