export type User = { id: number; name: string; lastName: string; fullName: string; email: string; role: string; isApproved: boolean }
export type AuthResponse = {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: User
}
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
export type School = {
  id: number;
  name: string;
}
export type SchoolResponse = {
  items: School[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
