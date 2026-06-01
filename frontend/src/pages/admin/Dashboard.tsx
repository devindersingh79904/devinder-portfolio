import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AdminDashboard() {
  const { data: queriesResp } = useQuery({
    queryKey: ['jd-queries'],
    queryFn: () => apiClient.get('/admin/jd-queries')
  })

  const { data: leadsResp } = useQuery({
    queryKey: ['contact-leads'],
    queryFn: () => apiClient.get('/admin/contact-leads')
  })

  const queries = queriesResp?.data?.content || []
  const leads = leadsResp?.data?.content || []

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total JD Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-extrabold text-primary">{queriesResp?.data?.totalElements || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Contact Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-extrabold text-primary">{leadsResp?.data?.totalElements || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Recent JD Queries</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Query Summary</TableHead>
                <TableHead>Match Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queries.slice(0, 5).map((q: any) => (
                <TableRow key={q.id}>
                  <TableCell>{new Date(q.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-md truncate">{q.query_text}</TableCell>
                  <TableCell className="font-bold text-primary">{q.match_score}%</TableCell>
                </TableRow>
              ))}
              {queries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No queries yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Recent Contact Leads</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.slice(0, 5).map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell>{new Date(l.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{l.name} ({l.email})</TableCell>
                  <TableCell>{l.subject}</TableCell>
                </TableRow>
              ))}
              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No leads yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
