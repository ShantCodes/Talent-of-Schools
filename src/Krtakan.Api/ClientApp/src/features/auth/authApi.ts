import { api, json } from '../../lib/api'
import type { AuthResponse, LoginRequest, RegisterRequest, RegisterResult, User } from './types'

export const authApi = {
  login: (request: LoginRequest) => api<AuthResponse>('/api/auth/login', json('POST', request)),
  register: (request: RegisterRequest) => api<RegisterResult>('/api/auth/register', json('POST', request)),
  me: () => api<User>('/api/auth/me'),
  changePassword: (password: string) => api<boolean>('/api/ChangePassword', json('POST', { password })),
}
