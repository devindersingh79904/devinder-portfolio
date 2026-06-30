import { Helmet } from 'react-helmet-async'
import { APP_NAME } from '@/constants'

interface SeoProps {
  title: string
  description?: string
  image?: string
  jsonLd?: Record<string, any> | null | false
}

// Centralizes page metadata: title, description, canonical, Open Graph, Twitter card,
// and optional JSON-LD structured data.
export function Seo({ title, description, image, jsonLd }: SeoProps) {
  const url = typeof window !== 'undefined' ? window.location.href : undefined
  const desc = description || `${APP_NAME} portfolio`
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
      {url && <link rel="canonical" href={url} />}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
