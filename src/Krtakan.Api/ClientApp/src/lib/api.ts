import { authStore } from '../features/auth/authStore'

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  const token = authStore.getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(url, { ...init, headers })
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { detail?: string } | null
    throw new Error(error?.detail ?? 'The request could not be completed.')
  }
  return response.json() as Promise<T>
}
