import { authStore } from '../features/auth/authStore'
import type { AuthResponse } from '../features/auth/types'
import { translate } from '../i18n/I18nContext'

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export function apiUrl(path: string) {
  return path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
}

function buildHeaders(init: RequestInit, token: string | null) {
  const headers = new Headers(init.headers)
  if (init.body !== undefined && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return headers
}

async function readError(response: Response) {
  const error = await response.json().catch(() => null) as { detail?: string; title?: string; errors?: Record<string, string[]> } | null
  if (error?.errors) return Object.values(error.errors).flat().join(' ')
  if (error?.detail) return error.detail
  if (response.status === 403) return translate('error.forbidden')
  if (response.status === 404) return translate('error.notFound')
  return error?.title ?? translate('error.generic')
}

async function readBody<T>(response: Response): Promise<T> {
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

let refreshing: Promise<AuthResponse> | null = null

export async function refreshSession() {
  const token = authStore.getRefreshToken()
  if (!token) throw new Error('No refresh token.')
  const response = await fetch(apiUrl('/api/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  if (!response.ok) throw new Error(await readError(response))
  const auth = await response.json() as AuthResponse
  authStore.save(auth)
  return auth
}

export async function api<T = void>(path: string, init: RequestInit = {}): Promise<T> {
  const url = apiUrl(path)
  let response = await fetch(url, { ...init, headers: buildHeaders(init, authStore.getToken()) })

  if (response.status === 401 && authStore.getRefreshToken() && !path.startsWith('/api/auth/')) {
    try {
      refreshing ??= refreshSession().finally(() => { refreshing = null })
      const refreshed = await refreshing
      response = await fetch(url, { ...init, headers: buildHeaders(init, refreshed.token) })
    } catch {
      authStore.clear()
      window.dispatchEvent(new Event('krtakan:logout'))
      throw new Error(translate('error.sessionExpired'))
    }
  }

  if (!response.ok) throw new Error(await readError(response))
  return readBody<T>(response)
}

export const json = (method: string, body?: unknown): RequestInit =>
  ({ method, body: body === undefined ? undefined : JSON.stringify(body) })

export async function downloadMedia(mediaId: number, fileName = `media_${mediaId}`) {
  const response = await fetch(apiUrl(`/api/media/download/${mediaId}`), { headers: buildHeaders({}, authStore.getToken()) })
  if (!response.ok) throw new Error(await readError(response))
  const blob = await response.blob()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  URL.revokeObjectURL(link.href)
}
