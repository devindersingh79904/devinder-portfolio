import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { API_ROUTES, QUERY_KEYS } from '@/constants'

const FEATURE_TOGGLES: { key: string; label: string; description: string }[] = [
  { key: 'jdMatchEnabled', label: 'JD Match', description: 'Public JD Match page, nav link, and API.' },
  { key: 'projectsEnabled', label: 'Projects', description: 'Projects section and pages.' },
  { key: 'skillsEnabled', label: 'Skills', description: 'Skills section and page.' },
  { key: 'experienceEnabled', label: 'Experience', description: 'Experience section and page.' },
  { key: 'educationEnabled', label: 'Education', description: 'Education section and page.' },
  { key: 'certificationsEnabled', label: 'Certifications', description: 'Certifications section and page.' },
  { key: 'contactEnabled', label: 'Contact', description: 'Public Contact page and form endpoint.' },
  { key: 'resumeEnabled', label: 'Resume Download', description: 'Public resume download.' },
  { key: 'analyticsEnabled', label: 'Analytics Tracking', description: 'Frontend analytics events.' },
]

export function AdminSettings() {
  const queryClient = useQueryClient()

  const { data: settingsResp, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_SETTINGS,
    queryFn: () => apiClient.get(API_ROUTES.ADMIN_SETTINGS),
  })
  const settings = settingsResp?.data

  const [jdModel, setJdModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  useEffect(() => {
    if (settings) setJdModel(settings.jdMatchModel || '')
  }, [settings])

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, any>) => apiClient.put(API_ROUTES.ADMIN_SETTINGS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_SETTINGS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PUBLIC_SETTINGS })
      toast.success('Settings updated successfully!')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update settings'),
  })

  if (isLoading) return <div className="p-8">Loading settings...</div>

  const keyStatus =
    settings?.anthropicApiKeySource === 'custom'
      ? 'Configured (custom)'
      : settings?.anthropicApiKeySource === 'env'
        ? 'Configured (env)'
        : 'Not set'

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Site Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Feature & Section Toggles</CardTitle>
          <CardDescription>Show or hide public-facing sections and features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {FEATURE_TOGGLES.map(t => (
            <div key={t.key} className="flex items-center justify-between gap-4 p-3 border rounded-lg">
              <div className="space-y-0.5">
                <p className="font-medium">{t.label}</p>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </div>
              <Switch
                checked={settings?.[t.key] ?? true}
                disabled={updateMutation.isPending}
                onCheckedChange={(checked) => updateMutation.mutate({ [t.key]: checked })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI / JD Match</CardTitle>
          <CardDescription>
            Configure the Claude-powered matcher. Leave the API key blank to use the server env value;
            it falls back to offline keyword matching when no key is configured anywhere.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-3 border rounded-lg">
            <div className="space-y-0.5">
              <p className="font-medium">Use LLM scoring</p>
              <p className="text-sm text-muted-foreground">When off, JD Match always uses the offline heuristic.</p>
            </div>
            <Switch
              checked={settings?.jdMatchLlmEnabled ?? true}
              disabled={updateMutation.isPending}
              onCheckedChange={(checked) => updateMutation.mutate({ jdMatchLlmEnabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jdModel">Model</Label>
            <div className="flex gap-2">
              <Input id="jdModel" value={jdModel} onChange={e => setJdModel(e.target.value)} placeholder="claude-haiku-4-5" />
              <Button variant="outline" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ jdMatchModel: jdModel })}>
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">Anthropic API Key</Label>
            <p className="text-sm text-muted-foreground">Status: {keyStatus}</p>
            <div className="flex gap-2">
              <Input id="apiKey" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter a new key to override env" />
              <Button variant="outline" disabled={!apiKey || updateMutation.isPending} onClick={() => { updateMutation.mutate({ anthropicApiKey: apiKey }); setApiKey('') }}>
                Save
              </Button>
              <Button variant="ghost" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ anthropicApiKey: '' })}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
