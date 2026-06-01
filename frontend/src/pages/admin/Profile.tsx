import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AdminProfile() {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [uploadMsg, setUploadMsg] = useState('')

  const { data: profileResp, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: () => apiClient.get('/admin/profile')
  })

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => apiClient.post('/admin/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] })
      setUploadMsg('Resume uploaded successfully!')
      setFile(null)
    },
    onError: (err: any) => {
      setUploadMsg(err.message || 'Failed to upload resume')
    }
  })

  const profile = profileResp?.data

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    uploadMutation.mutate(formData)
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Profile & Resume Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Resume Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-2">
            <h3 className="font-semibold">Current Resume</h3>
            {profile?.resume_url ? (
              <div className="flex items-center gap-4 p-4 border rounded bg-muted/20">
                <div className="flex-1">
                  <p className="font-medium">{profile.resume_file_name}</p>
                  <p className="text-sm text-muted-foreground">Last updated: {new Date(profile.resume_updated_at).toLocaleString()}</p>
                </div>
                <Button variant="outline" asChild>
                  <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/profile/resume/download`} target="_blank" rel="noreferrer">
                    Download & Preview
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No resume uploaded yet.</p>
            )}
          </div>

          <form onSubmit={handleUpload} className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Upload New Resume</h3>
            <p className="text-sm text-muted-foreground">Must be a PDF file under 10MB. Uploading will replace the existing resume.</p>
            
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="resume">Select PDF</Label>
                <Input id="resume" type="file" accept="application/pdf" onChange={handleFileChange} required />
              </div>
              <Button type="submit" disabled={!file || uploadMutation.isPending}>
                {uploadMutation.isPending ? 'Uploading...' : 'Upload & Replace'}
              </Button>
            </div>
            
            {uploadMsg && (
              <p className={`text-sm ${uploadMsg.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {uploadMsg}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
