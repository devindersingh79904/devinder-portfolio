import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'
import { API_ROUTES } from '@/constants'

export function JDMatch() {
  const [jdText, setJdText] = useState('')
  const [hrName, setHrName] = useState('')
  const [hrEmail, setHrEmail] = useState('')
  const [company, setCompany] = useState('')
  const [roleTitle, setRoleTitle] = useState('')

  const matchMutation = useMutation({
    mutationFn: (data: any) => apiClient.post(API_ROUTES.JD_MATCH, data),
    onSuccess: () => toast.success('Analysis complete!'),
    onError: (err: any) => toast.error(err?.message || 'Failed to analyze the job description')
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jdText) return
    matchMutation.mutate({
      jdText,
      hrName,
      hrEmail,
      companyName: company,
      roleTitle
    })
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-4xl space-y-8">
      <Helmet>
        <title>JD Match - Portfolio</title>
      </Helmet>
      
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Job Description Matcher</h1>
        <p className="text-lg text-muted-foreground">
          Are you an HR professional or recruiter? Paste your Job Description below to see how well my profile matches your requirements.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hrName">HR/Recruiter Name (Optional)</Label>
                <Input 
                  id="hrName" 
                  value={hrName} 
                  onChange={e => setHrName(e.target.value)} 
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hrEmail">HR/Recruiter Email (Optional)</Label>
                <Input 
                  id="hrEmail" 
                  type="email"
                  value={hrEmail} 
                  onChange={e => setHrEmail(e.target.value)} 
                  placeholder="e.g. jane@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name (Optional)</Label>
                <Input 
                  id="company" 
                  value={company} 
                  onChange={e => setCompany(e.target.value)} 
                  placeholder="e.g. Google"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleTitle">Role Title (Optional)</Label>
                <Input 
                  id="roleTitle" 
                  value={roleTitle} 
                  onChange={e => setRoleTitle(e.target.value)} 
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jd">Job Description *</Label>
              <Textarea 
                id="jd" 
                rows={10} 
                value={jdText} 
                onChange={e => setJdText(e.target.value)} 
                placeholder="Paste the full job description here..."
                required
              />
            </div>
            <Button type="submit" disabled={matchMutation.isPending}>
              {matchMutation.isPending ? 'Analyzing...' : 'Analyze Match'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {matchMutation.isSuccess && matchMutation.data?.data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl font-bold">Analysis Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Match Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-6xl font-extrabold text-primary">
                  {matchMutation.data.data.matchScore}%
                </div>
                <p className="mt-2 text-muted-foreground">{matchMutation.data.data.summary}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-1">Matched Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {matchMutation.data.data.matchedSkills.map((s: string) => (
                      <span key={s} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">{s}</span>
                    ))}
                    {matchMutation.data.data.matchedSkills.length === 0 && <span className="text-muted-foreground text-sm">None detected</span>}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-600 mb-1">Developing Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(matchMutation.data.data.weakSkills ?? []).map((s: string) => (
                      <span key={s} className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-sm">{s}</span>
                    ))}
                    {(matchMutation.data.data.weakSkills ?? []).length === 0 && <span className="text-muted-foreground text-sm">None detected</span>}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-1">Missing Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {matchMutation.data.data.missingSkills.map((s: string) => (
                      <span key={s} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">{s}</span>
                    ))}
                    {matchMutation.data.data.missingSkills.length === 0 && <span className="text-muted-foreground text-sm">None detected</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Relevant Experience & Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {matchMutation.data.data.relevantExperience.map((e: any, i: number) => (
                <div key={i} className="border-l-2 border-primary pl-4 py-1">
                  <div className="font-semibold">{e.role}</div>
                  <div className="text-sm text-muted-foreground">{e.companyName}</div>
                </div>
              ))}
              {matchMutation.data.data.relevantProjects.map((p: any, i: number) => (
                <div key={i} className="border-l-2 border-primary pl-4 py-1">
                  <div className="font-semibold">Project: {p.title}</div>
                </div>
              ))}
              {(matchMutation.data.data.relevantExperience.length === 0 && matchMutation.data.data.relevantProjects.length === 0) && (
                <p className="text-muted-foreground">No specific matching experience found in profile.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
