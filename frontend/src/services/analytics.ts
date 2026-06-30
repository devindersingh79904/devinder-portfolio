import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { apiClient } from '@/services/api'
import { API_ROUTES } from '@/constants'
import { ANALYTICS_EVENTS } from '@/constants/analyticsEvents'

// Analytics is opt-in via VITE_ENABLE_ANALYTICS (defaults to enabled when unset).
const ANALYTICS_ENABLED = import.meta.env.VITE_ENABLE_ANALYTICS !== 'false'

// Runtime override driven by the admin Settings analytics flag (set from PublicLayout).
let runtimeEnabled = true
export function setAnalyticsEnabled(enabled: boolean) {
  runtimeEnabled = enabled
}

export function trackEvent(
  eventType: string,
  pageUrl: string = window.location.pathname,
  metadata?: Record<string, unknown>
) {
  if (!ANALYTICS_ENABLED || !runtimeEnabled) return
  // Fire-and-forget; never block UX or surface errors to the user.
  apiClient
    .post(API_ROUTES.ANALYTICS_EVENTS, { eventType, pageUrl, metadata })
    .catch(() => {})
}

// Fires a PAGE_VIEW event whenever the route changes.
export function usePageViewTracker() {
  const location = useLocation()
  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, location.pathname)
  }, [location.pathname])
}
