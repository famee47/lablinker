import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'

// Public Pages
import Home from './pages/public/Home'
import About from './pages/public/About'
import Contact from './pages/public/Contact'
import LabsDirectory from './pages/public/LabsDirectory'
import TestsDirectory from './pages/public/TestsDirectory'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard'
import BrowseTests from './pages/patient/BrowseTests'
import BookingPage from './pages/patient/BookingPage'
import BookingHistory from './pages/patient/BookingHistory'
import PatientProfile from './pages/patient/PatientProfile'
import HealthRecords from './pages/patient/HealthRecords'

// Lab Pages
import LabDashboard from './pages/lab/LabDashboard'
import ManageTests from './pages/lab/ManageTests'
import BookingManagement from './pages/lab/BookingManagement'
import TechnicianManagement from './pages/lab/TechnicianManagement'
import LabProfile from './pages/lab/LabProfile'

// Technician Pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import UsersManagement from './pages/admin/UsersManagement'
import LabsApproval from './pages/admin/LabsApproval'
import Analytics from './pages/admin/Analytics'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  if (user) {
    const redirects = { patient: '/dashboard', lab: '/lab/dashboard', technician: '/technician/dashboard', admin: '/admin/dashboard' }
    return <Navigate to={redirects[user.role] || '/'} replace />
  }
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/labs" element={<LabsDirectory />} />
              <Route path="/tests" element={<TestsDirectory />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

            {/* Patient Routes */}
            <Route path="/dashboard" element={<ProtectedRoute roles={['patient']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<PatientDashboard />} />
              <Route path="tests" element={<BrowseTests />} />
              <Route path="book/:testId" element={<BookingPage />} />
              <Route path="history" element={<BookingHistory />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="records" element={<HealthRecords />} />
            </Route>

            {/* Lab Routes */}
            <Route path="/lab" element={<ProtectedRoute roles={['lab']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<LabDashboard />} />
              <Route path="tests" element={<ManageTests />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="technicians" element={<TechnicianManagement />} />
              <Route path="profile" element={<LabProfile />} />
            </Route>

            {/* Technician Routes */}
            <Route path="/technician" element={<ProtectedRoute roles={['technician']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TechnicianDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="labs" element={<LabsApproval />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
