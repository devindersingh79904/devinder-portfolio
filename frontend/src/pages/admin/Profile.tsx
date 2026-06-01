import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function AdminProfile() {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)

  const { register, handleSubmit, reset } = useForm()

  const { data: profileResp, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: () => apiClient.get('/admin/profile')
  })
  const profile = profileResp?.data

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name,
        headline: profile.headline,
        summary: profile.summary,
        location: profile.location,
        email: profile.email,
        phone: profile.phone,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url
      })
    }
  }, [profile, reset])

  const profileMutation = useMutation({
    mutationFn: (data: any) => apiClient.put('/admin/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] })
      toast.success('Profile details updated successfully!')
    },
    onError: () => toast.error('Failed to update profile details')
  })

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => apiClient.post('/admin/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] })
      toast.success('Resume uploaded successfully!')
      setFile(null)
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to upload resume')
    }
  })

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

  const onProfileSubmit = (data: any) => {
    profileMutation.mutate(data)
  }

  if (isLoading) return <div className="p-8">Loading profile...</div>

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Profile & Resume Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" {...register('full_name')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input id="headline" {...register('headline')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register('location')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input id="linkedin_url" {...register('linkedin_url')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input id="github_url" {...register('github_url')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" {...register('summary')} className="min-h-[100px]" />
            </div>
            <Button type="submit" disabled={profileMutation.isPending}>
              {profileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

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
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
