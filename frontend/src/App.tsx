import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'

// Public pages
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const SignupPage = lazy(() => import('@/pages/auth/SignupPage'))

// Customer pages
const CustomerDashboard = lazy(() => import('@/pages/customer/Dashboard'))
const VehiclesPage = lazy(() => import('@/pages/customer/VehiclesPage'))
const BookServicePage = lazy(() => import('@/pages/customer/BookServicePage'))
const RequestsPage = lazy(() => import('@/pages/customer/RequestsPage'))
const InvoicePage = lazy(() => import('@/pages/customer/InvoicePage'))
const HistoryPage = lazy(() => import('@/pages/customer/HistoryPage'))

// Mechanic pages
const MechanicDashboard = lazy(() => import('@/pages/mechanic/Dashboard'))
const JobsPage = lazy(() => import('@/pages/mechanic/JobsPage'))

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Customer routes */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute role="customer">
                <AppShell role="customer" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="book" element={<BookServicePage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="invoice/:id" element={<InvoicePage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>

          {/* Mechanic routes */}
          <Route
            path="/mechanic"
            element={
              <ProtectedRoute role="mechanic">
                <AppShell role="mechanic" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MechanicDashboard />} />
            <Route path="jobs" element={<JobsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
