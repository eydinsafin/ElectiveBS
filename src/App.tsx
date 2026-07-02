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
import ReportsAnalytics from './pages/ReportsAnalytics'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
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
                <Route path="/"        element={<AgencyDashboard />} />
                <Route path="/director" element={<RequireAuth><DirectorDashboard /></RequireAuth>} />
                <Route path="/schedule" element={<ScheduleOverview />} />
                <Route path="/events"   element={<EventsPage />} />
                <Route path="/events/create"       element={<CreateEvent />} />
                <Route path="/events/:id"          element={<EventDetails />} />
                <Route path="/events/:id/staff"    element={<StaffManagement />} />
                <Route path="/events/:id/vendors"  element={<VendorManagement />} />
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
