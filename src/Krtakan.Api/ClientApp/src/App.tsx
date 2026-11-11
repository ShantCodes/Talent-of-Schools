import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, Roles } from './context/AuthContext';
import { I18nProvider } from './i18n/I18nContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './pages/admin/AdminLayout';
import { EventListPage } from './pages/admin/events/EventListPage';
import { EventFormPage } from './pages/admin/events/EventFormPage';
import { EventParticipantsPage } from './pages/admin/events/EventParticipantsPage';
import { UserListPage } from './pages/admin/users/UserListPage';
import { UserCreatePage } from './pages/admin/users/UserCreatePage';
import { UserEditPage } from './pages/admin/users/UserEditPage';
import { RoleFormPage, RoleListPage } from './pages/admin/roles/RolePages';
import { SchoolFormPage, SchoolListPage } from './pages/admin/schools/SchoolPages';
import { StudentEventsPage } from './pages/student/EventsPage';
import { JuryPage } from './pages/jury/JuryPage';
import { AccountPage } from './pages/account/AccountPage';

export default function App() {
  return (
    <HelmetProvider>
    <HashRouter>
      <ThemeProvider>
        <I18nProvider>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/account" element={<AccountPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={[Roles.Student, Roles.Admin, Roles.Juror]} />}>
              <Route path="/events" element={<StudentEventsPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={[Roles.Juror, Roles.Admin]} />}>
              <Route path="/jury" element={<JuryPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={[Roles.Admin]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="events" replace />} />
                <Route path="events" element={<EventListPage />} />
                <Route path="events/new" element={<EventFormPage key="new" />} />
                <Route path="events/:id/edit" element={<EventFormPage />} />
                <Route path="events/:id" element={<EventParticipantsPage />} />
                <Route path="users" element={<UserListPage />} />
                <Route path="users/new" element={<UserCreatePage />} />
                <Route path="users/:id/edit" element={<UserEditPage />} />
                <Route path="roles" element={<RoleListPage />} />
                <Route path="roles/new" element={<RoleFormPage key="new" />} />
                <Route path="roles/:id/edit" element={<RoleFormPage />} />
                <Route path="schools" element={<SchoolListPage />} />
                <Route path="schools/new" element={<SchoolFormPage key="new" />} />
                <Route path="schools/:id/edit" element={<SchoolFormPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </HashRouter>
    </HelmetProvider>
  );
}
