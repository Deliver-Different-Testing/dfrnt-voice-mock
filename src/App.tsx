import { Route, Routes, Navigate } from 'react-router-dom'
import { Shell } from './components/Shell'
import Landing from './pages/Landing'
import VoiceAgent from './pages/VoiceAgent'
import Simulator from './pages/Simulator'
import ThreeCx from './pages/ThreeCx'
import { TenantProvider } from './voice/tenant'
import Overview from './voice/Overview'
import Training from './voice/Training'
import Practise from './voice/Practise'
import Settings from './voice/Settings'
import Number from './voice/Number'
import Calls from './voice/Calls'
import Tenants from './voice/Tenants'
import Hub from './voice/Hub'
import { useTenant } from './voice/tenant'
import { Outlet } from 'react-router-dom'

// Tenants without the add-on are sent to the Hub to upgrade. Staff can still open Tenants.
function Subscribed() {
  const { subscribed } = useTenant()
  return subscribed ? <Outlet /> : <Navigate to="/hub" replace />
}

export default function App() {
  return (
    <TenantProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<Navigate to="/hub" replace />} />
          <Route path="/hub" element={<Hub />} />
          <Route path="/app/tenants" element={<Tenants />} />
          <Route element={<Subscribed />}>
          <Route path="/app" element={<Overview />} />
          <Route path="/app/training" element={<Training />} />
          <Route path="/app/training/:tab" element={<Training />} />
          <Route path="/app/practise" element={<Practise />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app/settings/:tab" element={<Settings />} />
          <Route path="/app/number" element={<Number />} />
          <Route path="/app/calls" element={<Calls />} />
          </Route>
          <Route path="/about" element={<Landing />} />
          <Route path="/voice-agent" element={<VoiceAgent />} />
          <Route path="/voice-agent/:tab" element={<VoiceAgent />} />
          <Route path="/3cx" element={<ThreeCx />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/simulator/:scenario" element={<Simulator />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Shell>
    </TenantProvider>
  )
}
