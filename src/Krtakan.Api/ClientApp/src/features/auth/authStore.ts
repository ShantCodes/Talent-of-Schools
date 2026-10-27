import type { AuthResponse } from './types'
const key = 'krtakan.auth'
export const authStore = {
  save: (value: AuthResponse) => localStorage.setItem(key, JSON.stringify(value)),
  clear: () => localStorage.removeItem(key),
  get: (): AuthResponse | null => { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as AuthResponse : null },
  getToken: () => authStore.get()?.token ?? null,
}
