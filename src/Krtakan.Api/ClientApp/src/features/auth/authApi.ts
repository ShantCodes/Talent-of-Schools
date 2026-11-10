import { api } from '../../lib/api'
import type { AuthResponse, LoginRequest, RegisterRequest } from './types'

export const authApi = {
  login: (request: LoginRequest) => api<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(request) }),
  register: (request: RegisterRequest) => api<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(request) }),
}
