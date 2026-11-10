export type User = { id: number; name: string; lastName: string; fullName: string; email: string; role: string; isApproved: boolean }
export type AuthResponse = { token: string; expiresAt: string; user: User }
export type LoginRequest = { email: string; password: string }
export type RegisterRequest = {
  name: string;
  lastName: string;
  birthDate: string;
  email: string;
  password: string;
  schoolId?: number;
  grade?: number;
}
