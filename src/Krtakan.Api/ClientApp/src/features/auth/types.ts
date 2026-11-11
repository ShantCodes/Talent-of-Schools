export type User = {
  id: number;
  name: string;
  lastName: string;
  fullName: string;
  email: string;
  birthDate?: string;
  roles: string[];
  schoolId?: number | null;
  schoolName?: string | null;
  grade?: number | null;
  isApproved: boolean;
  registerDate?: string;
  profilePictureMediaId?: number | null;
  profilePictureUrl?: string | null;
}
export type AuthResponse = {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: User
}
export type RegisterResult = { message: string; user: User }
export type LoginRequest = { email: string; password: string }
export type RegisterRequest = {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  schoolId: number | null;
}
export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
export type School = {
  id: number;
  name: string;
}
export type SchoolResponse = PagedResult<School>
export type Role = { id: number; name: string }
