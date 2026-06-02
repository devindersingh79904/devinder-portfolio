import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Helmet } from 'react-helmet-async'
import { API_ROUTES } from '@/constants'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  })
  const [success, setSuccess] = useState(false)

  const contactMutation = useMutation({
    mutationFn: (data: typeof formData) => apiClient.post(API_ROUTES.CONTACT, data),
    onSuccess: () => setSuccess(true)
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    contactMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl space-y-8">
      <Helmet>
        <title>Contact - Portfolio</title>
      </Helmet>
      
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Get In Touch</h1>
        <p className="text-lg text-muted-foreground">
          Have a question or want to work together? Leave a message below.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {success ? (
            <div className="text-center space-y-4 py-8">
              <h2 className="text-2xl font-bold text-green-600">Message Sent!</h2>
              <p className="text-muted-foreground">Thank you for reaching out. I'll get back to you as soon as possible.</p>
              <Button onClick={() => setSuccess(false)} variant="outline">Send Another Message</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input id="company" value={formData.company} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input id="subject" value={formData.subject} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea id="message" rows={5} value={formData.message} onChange={handleChange} required />
              </div>
              
              {contactMutation.isError && (
                <div className="text-sm text-red-600">{contactMutation.error.message}</div>
              )}
              
              <Button type="submit" className="w-full" disabled={contactMutation.isPending}>
                {contactMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
