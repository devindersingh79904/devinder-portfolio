import { useQuery } from '@tanstack/react-query'
import { apiClient, getResumeDownloadUrl } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Helmet } from 'react-helmet-async'
// lucide brand icons (Linkedin/Github) aren't bundled in this build; use generic ones.
import { Mail, Phone, Briefcase, Code2, MapPin, Download } from 'lucide-react'
import { API_ROUTES, QUERY_KEYS } from '@/constants'
import type { Profile } from '@/types'

export function Contact() {
  const { data: profileResp, isLoading } = useQuery({
    queryKey: QUERY_KEYS.PUBLIC_PROFILE,
    queryFn: () => apiClient.get(API_ROUTES.PROFILE)
  })

  const profile: Profile | undefined = (profileResp as any)?.data

  const items = [
    profile?.email && {
      icon: Mail,
      label: 'Email',
      value: profile.email,
      href: `mailto:${profile.email}`,
    },
    profile?.phone && {
      icon: Phone,
      label: 'Phone',
      value: profile.phone,
      href: `tel:${profile.phone.replace(/\s+/g, '')}`,
    },
    profile?.linkedinUrl && {
      icon: Briefcase,
      label: 'LinkedIn',
      value: profile.linkedinUrl.replace(/^https?:\/\//, ''),
      href: profile.linkedinUrl,
      external: true,
    },
    profile?.githubUrl && {
      icon: Code2,
      label: 'GitHub',
      value: profile.githubUrl.replace(/^https?:\/\//, ''),
      href: profile.githubUrl,
      external: true,
    },
    profile?.location && {
      icon: MapPin,
      label: 'Location',
      value: profile.location,
    },
  ].filter(Boolean) as Array<{ icon: any; label: string; value: string; href?: string; external?: boolean }>

  return (
    <div className="container mx-auto p-4 sm:p-8 max-w-2xl space-y-8">
      <Helmet>
        <title>Contact - Portfolio</title>
      </Helmet>

      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Get In Touch</h1>
        <p className="text-lg text-muted-foreground">
          Feel free to reach out through any of the channels below.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading contact details...</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const Icon = item.icon
                const content = (
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/40 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground shrink-0">
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium break-words">{item.value}</p>
                    </div>
                  </div>
                )
                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className="block"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.label}>{content}</div>
                )
              })}

              {items.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Contact details are not available yet.</p>
              )}

              {profile?.resumeUrl && (
                <div className="pt-2">
                  <Button asChild className="w-full" size="lg">
                    <a href={getResumeDownloadUrl()} target="_blank" rel="noreferrer">
                      <Download size={18} className="mr-2" /> Download Resume
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
