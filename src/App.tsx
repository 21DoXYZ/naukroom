import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import Landing from '@/pages/landing'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import Onboarding from '@/pages/onboarding'
import ValueMoment from '@/pages/onboarding/ValueMoment'
import Dashboard from '@/pages/dashboard'
import ProfileAudit from '@/pages/audit'
import OfferBuilder from '@/pages/offer'
import ProfilePackaging from '@/pages/packaging'
import LeadMagnetPage from '@/pages/lead-magnet'
import FunnelPage from '@/pages/funnel'
import ContentPage from '@/pages/content'
import ExportPage from '@/pages/export'
import MarketingPackPage from '@/pages/marketing-pack'
import Admin from '@/pages/admin'
import AdminUserDetail from '@/pages/admin/UserDetail'
import LiteLanding from '@/pages/lite/Landing'
import LiteTool from '@/pages/lite/Tool'
import LiteResult from '@/pages/lite/Result'
import LiteWaitlist from '@/pages/lite/Waitlist'
import LiteBeta from '@/pages/lite/Beta'
import LiteDemo from '@/pages/lite/Demo'
import { Spinner } from '@/components/ui/Spinner'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-6 w-6 text-black" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-6 w-6 text-black" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
      <Route path="/onboarding/result" element={<RequireAuth><ValueMoment /></RequireAuth>} />

      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/audit" element={<RequireAuth><ProfileAudit /></RequireAuth>} />
      <Route path="/offer" element={<RequireAuth><OfferBuilder /></RequireAuth>} />
      <Route path="/packaging" element={<RequireAuth><ProfilePackaging /></RequireAuth>} />
      <Route path="/lead-magnet" element={<RequireAuth><LeadMagnetPage /></RequireAuth>} />
      <Route path="/funnel" element={<RequireAuth><FunnelPage /></RequireAuth>} />
      <Route path="/content" element={<RequireAuth><ContentPage /></RequireAuth>} />
      <Route path="/export" element={<RequireAuth><ExportPage /></RequireAuth>} />
      <Route path="/marketing-pack" element={<RequireAuth><MarketingPackPage /></RequireAuth>} />

      <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
      <Route path="/admin/users/:id" element={<RequireAdmin><AdminUserDetail /></RequireAdmin>} />

      {/* GTM artifact shell — public, no auth */}
      <Route path="/lite" element={<LiteLanding />} />
      <Route path="/lite/tool" element={<LiteTool />} />
      <Route path="/lite/result" element={<LiteResult />} />
      <Route path="/lite/waitlist" element={<LiteWaitlist />} />
      <Route path="/lite/beta" element={<LiteBeta />} />
      <Route path="/lite/demo" element={<LiteDemo />} />

      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
