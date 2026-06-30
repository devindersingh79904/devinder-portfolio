import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { API_ROUTES, QUERY_KEYS } from '@/constants'

export function AdminSettings() {
  const queryClient = useQueryClient()

  const { data: settingsResp, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_SETTINGS,
    queryFn: () => apiClient.get(API_ROUTES.ADMIN_SETTINGS)
  })
  const settings = settingsResp?.data
  const jdMatchEnabled: boolean = settings?.jdMatchEnabled ?? true

  const updateMutation = useMutation({
    mutationFn: (data: { jdMatchEnabled: boolean }) => apiClient.put(API_ROUTES.ADMIN_SETTINGS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_SETTINGS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PUBLIC_SETTINGS })
      toast.success('Settings updated successfully!')
    },
    onError: () => toast.error('Failed to update settings')
  })

  if (isLoading) return <div className="p-8">Loading settings...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Site Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Feature Toggles</CardTitle>
          <CardDescription>Enable or disable public-facing features.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">JD Match</p>
              <p className="text-sm text-muted-foreground">
                When disabled, the JD Match page and navigation link are hidden from visitors and the
                public API is blocked.
              </p>
            </div>
            <label className="flex items-center gap-2 shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={jdMatchEnabled}
                disabled={updateMutation.isPending}
                onChange={(e) => updateMutation.mutate({ jdMatchEnabled: e.target.checked })}
                className="h-5 w-5 rounded border-input accent-primary cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">{jdMatchEnabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
