import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Helmet } from 'react-helmet-async'
import { API_ROUTES, QUERY_KEYS } from '@/constants'

export function PublicSkills() {
  const { data: skillsResp, isLoading } = useQuery({
    queryKey: QUERY_KEYS.PUBLIC_SKILLS,
    queryFn: () => apiClient.get(API_ROUTES.SKILLS)
  })

  const skills: any[] = skillsResp?.data || []

  if (isLoading) return <div className="p-8">Loading skills...</div>

  // Group skills by category, preserving display order.
  const grouped = skills.reduce((acc: Record<string, any[]>, s: any) => {
    const cat = s.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-8 max-w-5xl">
      <Helmet>
        <title>Skills - Portfolio</title>
      </Helmet>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Technical Skills</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(grouped).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-xl">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((s: any) => (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    {typeof s.proficiency === 'number' && (
                      <span className="text-muted-foreground">{s.proficiency}%</span>
                    )}
                  </div>
                  {typeof s.proficiency === 'number' && (
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, s.proficiency))}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {skills.length === 0 && <p className="text-muted-foreground">No skills listed.</p>}
      </div>
    </div>
  )
}
