import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function AdminDashboard() {
  const { data: statsResp, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.get('/admin/dashboard/stats')
  })

  if (isLoading) {
    return <div>Loading dashboard...</div>
  }

  const stats = statsResp?.data || {}
  const queries = stats.recentJdQueries || []
  const leads = stats.recentContactLeads || []

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>JD Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-extrabold text-primary">{stats.totalJdQueries || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Match Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-extrabold text-primary">{stats.averageMatchScore || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contact Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-extrabold text-primary">{stats.totalContactLeads || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resume Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-extrabold text-primary">{stats.totalResumeDownloads || 0}</div>
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
                <TableHead>HR / Company</TableHead>
                <TableHead>Query Summary</TableHead>
                <TableHead>Match Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queries.map((q: any) => (
                <TableRow key={q.id}>
                  <TableCell>{new Date(q.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{q.hr_name} @ {q.company_name}</TableCell>
                  <TableCell className="max-w-md truncate">{q.jd_text}</TableCell>
                  <TableCell className="font-bold text-primary">{q.match_score}%</TableCell>
                </TableRow>
              ))}
              {queries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No queries yet</TableCell>
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
              {leads.map((l: any) => (
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
