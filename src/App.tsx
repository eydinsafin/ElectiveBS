import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { EventsProvider } from './context/EventsContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import type { ReactNode } from 'react'
import Layout from './components/Layout'
import LoginOnboarding from './pages/LoginOnboarding'
import DirectorDashboard from './pages/DirectorDashboard'
import AgencyDashboard from './pages/AgencyDashboard'
import CreateEvent from './pages/CreateEvent'
import EventDetails from './pages/EventDetails'
import EventsPage from './pages/EventsPage'
import ScheduleOverview from './pages/ScheduleOverview'
import PayrollProcessing from './pages/PayrollProcessing'
import StaffDirectory from './pages/StaffDirectory'
import StaffManagement from './pages/StaffManagement'
import VendorManagement from './pages/VendorManagement'
import VendorDirectory from './pages/VendorDirectory'
import Attendance from './pages/Attendance'
import ReportsAnalytics from './pages/ReportsAnalytics'
import StaffPortal from './pages/StaffPortal'
import VendorPortal from './pages/VendorPortal'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function RequireRole({ role, children }: { role: 'Staff' | 'Vendor'; children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/" replace />
  return <>{children}</>
}

function HomeRedirect() {
  const { user } = useAuth()
  if (user?.role === 'Staff')  return <Navigate to="/portal/staff"  replace />
  if (user?.role === 'Vendor') return <Navigate to="/portal/vendor" replace />
  return <AgencyDashboard />
}

export default function App() {
  return (
    <ThemeProvider>
    <ToastProvider>
    <AuthProvider>
    <BrowserRouter>
      <EventsProvider>
        <Routes>
          {/* Standalone — no Layout */}
          <Route path="/login" element={<LoginOnboarding />} />

          {/* App shell */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/"        element={<HomeRedirect />} />
                <Route path="/portal/staff"   element={<RequireRole role="Staff"><StaffPortal /></RequireRole>} />
                <Route path="/portal/vendor"  element={<RequireRole role="Vendor"><VendorPortal /></RequireRole>} />
                <Route path="/director" element={<RequireAuth><DirectorDashboard /></RequireAuth>} />
                <Route path="/schedule" element={<ScheduleOverview />} />
                <Route path="/events"   element={<EventsPage />} />
                <Route path="/events/create"       element={<CreateEvent />} />
                <Route path="/events/:id"          element={<EventDetails />} />
                <Route path="/events/:id/staff"      element={<StaffManagement />} />
                <Route path="/events/:id/vendors"  element={<VendorManagement />} />
                <Route path="/events/:id/attendance" element={<Attendance />} />
                <Route path="/staff"   element={<StaffDirectory />} />
                <Route path="/vendors" element={<VendorDirectory />} />
                <Route path="/payroll/:id" element={<PayrollProcessing />} />
                <Route path="/reports"    element={<ReportsAnalytics />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </EventsProvider>
    </BrowserRouter>
    </AuthProvider>
    </ToastProvider>
    </ThemeProvider>
  )
}
