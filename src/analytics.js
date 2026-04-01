import { inject } from '@vercel/analytics'

const ANALYTICS_FLAG = '__standstrongAnalyticsInjected__'

export function initAnalytics() {
  if (typeof window === 'undefined') return
  if (window[ANALYTICS_FLAG]) return

  inject()
  window[ANALYTICS_FLAG] = true
}
