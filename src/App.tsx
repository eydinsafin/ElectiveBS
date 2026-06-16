import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DirectorDashboard from './pages/DirectorDashboard'
import AgencyDashboard from './pages/AgencyDashboard'
import CreateEvent from './pages/CreateEvent'
import EventDetails from './pages/EventDetails'
import EventsPage from './pages/EventsPage'
import ScheduleOverview from './pages/ScheduleOverview'
import PayrollProcessing from './pages/PayrollProcessing'
import StaffDirectory from './pages/StaffDirectory'
import ReportsAnalytics from './pages/ReportsAnalytics'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<AgencyDashboard />} />
          <Route path="/director" element={<DirectorDashboard />} />
          <Route path="/schedule" element={<ScheduleOverview />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/staff" element={<StaffDirectory />} />
          <Route path="/payroll/:id" element={<PayrollProcessing />} />
          <Route path="/reports" element={<ReportsAnalytics />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
