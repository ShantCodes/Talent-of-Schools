import { authStore } from '../features/auth/authStore'
import { authApi } from '../features/auth/authApi'

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  const token = authStore.getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(url, { ...init, headers })

  if (response.status === 401) {
    try {
      const refreshed = await authApi.refresh()
      authStore.save(refreshed)

      const newHeaders = new Headers(init.headers)
      newHeaders.set('Content-Type', 'application/json')
      newHeaders.set('Authorization', `Bearer ${refreshed.token}`)

      const retryResponse = await fetch(url, { ...init, headers: newHeaders })
      if (!retryResponse.ok) {
        const error = await retryResponse.json().catch(() => null) as { detail?: string } | null
        throw new Error(error?.detail ?? 'The request could not be completed.')
      }
      return retryResponse.json() as Promise<T>
    } catch (refreshError) {
      authStore.clear()
      throw new Error('Session expired. Please log in again.')
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null) as { detail?: string } | null
    throw new Error(error?.detail ?? 'The request could not be completed.')
  }

  return response.json() as Promise<T>
}
