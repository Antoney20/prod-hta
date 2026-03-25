import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { cookies } from 'next/headers'

const LIMIT = 50
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

interface RateLimitState {
  count: number
  windowStart: number
}

export function checkSearchRateLimit(
  cookieStore: ReadonlyRequestCookies
): { allowed: boolean; remaining: number } {
  const raw = cookieStore.get('_srch_rl')?.value

  const now = Date.now()
  let state: RateLimitState = { count: 0, windowStart: now }

  if (raw) {
    try {
      const parsed: RateLimitState = JSON.parse(atob(raw))
      if (now - parsed.windowStart < WINDOW_MS) {
        state = parsed
      }
    } catch {
    }
  }

  if (state.count >= LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: LIMIT - state.count }
}

// Call this to build the Set-Cookie value after a successful search
export function buildRateLimitCookieValue(existing?: string): string {
  const now = Date.now()
  let state: RateLimitState = { count: 0, windowStart: now }

  if (existing) {
    try {
      const parsed: RateLimitState = JSON.parse(atob(existing))
      if (now - parsed.windowStart < WINDOW_MS) {
        state = { count: parsed.count + 1, windowStart: parsed.windowStart }
      } else {
        state = { count: 1, windowStart: now }
      }
    } catch {
      state = { count: 1, windowStart: now }
    }
  } else {
    state = { count: 1, windowStart: now }
  }

  return btoa(JSON.stringify(state))
}