import { api } from '../../lib/api'
import type { AuthResponse, LoginRequest } from './types'
export const authApi = { login: (request: LoginRequest) => api<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(request) }) }
