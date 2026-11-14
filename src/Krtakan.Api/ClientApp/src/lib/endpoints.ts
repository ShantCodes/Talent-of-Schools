import { api, apiUrl, buildHeaders, json } from './api'
import type { PagedResult, RegisterRequest, RegisterResult, Role, School, User } from '../features/auth/types'
import { authStore } from '../features/auth/authStore';

export type EventItem = {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  minBirthDate: string | null;
  maxBirthDate: string | null;
}
export type EventInput = Omit<EventItem, 'id'>

export type Participant = {
  id: number;
  title: string;
  author: string;
  userId: number;
  eventId: number;
  documentId: number | null;
  fullName?: string | null;
  email?: string | null;
}

export type ParticipantResult = {
  title: string;
  author: string;
  userName: string;
  userLastName: string;
  profilePictureId: number | null;
  averageScore: number;
}

const paged = (pageNumber: number, pageSize: number) => `pageNumber=${pageNumber}&pageSize=${pageSize}`

// The API has no "get by id" endpoints, so single items are looked up in the full list.
export async function findById<T extends { id: number }>(list: (pageNumber: number, pageSize: number) => Promise<PagedResult<T>>, id: number) {
  const result = await list(1, 1000)
  return result.items.find(item => item.id === id) ?? null
}

export const eventsApi = {
  list: (pageNumber = 1, pageSize = 10) => api<PagedResult<EventItem>>(`/api/events?${paged(pageNumber, pageSize)}`),
  create: (input: EventInput) => api<EventItem>('/api/events', json('POST', input)),
  update: (id: number, input: EventInput) => api(`/api/events/${id}`, json('PUT', input)),
  remove: (id: number) => api(`/api/events/${id}`, { method: 'DELETE' }),
}

export const participantsApi = {
  byEvent: (eventId: number, pageNumber = 1, pageSize = 10) =>
    api<PagedResult<Participant>>(`/api/EventParticipant/event/${eventId}/details?${paged(pageNumber, pageSize)}`),
  signUp: (eventId: number, title: string, author: string, file?: File | null) => {
    const form = new FormData()
    form.append('Title', title)
    form.append('Author', author)
    form.append('EventId', String(eventId))
    if (file) form.append('File', file)
    return api<Participant>('/api/EventParticipant/signup', { method: 'POST', body: form })
  },
  update: (id: number, title: string, author: string, documentId: number | null) =>
    api(`/api/EventParticipant/${id}`, json('PUT', { title, author, documentId })),
  remove: (id: number) => api(`/api/EventParticipant/${id}`, { method: 'DELETE' }),
  results: (eventId: number) => api<ParticipantResult[]>(`/results/${eventId}`),
}

export const scoringApi = {
  score: (input: { eventParticipantId: number; jurorId: number; eventId: number; score: number }) =>
    api('/api/Scoring', json('POST', { ...input, performanceId: null })),
}

export type UserFilter = 'all' | 'pending' | 'approved'
const userListPath: Record<UserFilter, string> = {
  all: '/api/users/GetAllUsers',
  pending: '/api/users/pending',
  approved: '/api/users/GetApprovedUsers',
}

export const usersApi = {
  list: (filter: UserFilter, pageNumber = 1, pageSize = 10) => api<PagedResult<User>>(`${userListPath[filter]}?${paged(pageNumber, pageSize)}`),
  search: (input: string, pageNumber = 1, pageSize = 10) =>
    api<PagedResult<User>>(
      `/api/users/search?input=${encodeURIComponent(input)}&${paged(pageNumber, pageSize)}`
    ),
  // There is no admin "create user" endpoint, so new users go through public registration and are then approved.
  create: (input: RegisterRequest) => api<RegisterResult>('/api/auth/register', json('POST', input)),
  approve: (id: number, isApproved: boolean) => api<User>(`/api/users/${id}/approve?isApproved=${isApproved}`, { method: 'PATCH' }),
  setRoles: (id: number, roleIds: number[]) => api<User>(`/api/users/${id}/role`, json('PATCH', roleIds)),
  remove: (id: number) => api(`/api/users/${id}`, { method: 'DELETE' }),
  setPassword: (email: string, password: string) => api('/api/adminchangepassword', json('PATCH', { username: email, password })),
  updateProfile: (input: FormData) =>
    api<User>('/api/users/updateProfile', {
      method: 'POST',
      body: input,
    }),
  getProfilePicture: async (mediaId: number): Promise<Blob> => {
    const response = await fetch(apiUrl(`/api/media/download/${mediaId}`), {
      headers: buildHeaders({}, authStore.getToken()),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile picture');
    }

    return response.blob();
  },
}

export const rolesApi = {
  list: (pageNumber = 1, pageSize = 10) => api<PagedResult<Role>>(`/api/roles?${paged(pageNumber, pageSize)}`),
  create: (name: string) => api('/api/roles', json('POST', { id: 0, name })),
  update: (id: number, name: string) => api(`/api/roles/${id}`, json('PUT', { id, name })),
  remove: (id: number) => api(`/api/roles/${id}`, { method: 'DELETE' }),
}

export const schoolsApi = {
  list: (pageNumber = 1, pageSize = 10) => api<PagedResult<School>>(`/api/schools?${paged(pageNumber, pageSize)}`),
  create: (name: string) => api('/api/schools', json('POST', { id: 0, name })),
  update: (id: number, name: string) => api(`/api/schools/${id}`, json('PUT', { id, name })),
  remove: (id: number) => api(`/api/schools/${id}`, { method: 'DELETE' }),
}
