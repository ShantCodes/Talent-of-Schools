export type User = { id: number; name: string; lastName: string; fullName: string; email: string; role: string; isApproved: boolean }
export type AuthResponse = { token: string; expiresAt: string; user: User }
export type LoginRequest = { email: string; password: string }
