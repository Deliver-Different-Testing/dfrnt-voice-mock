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

export default function App() {
  return (
    <TenantProvider>
      <Shell>
        <Routes>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="/app" element={<Overview />} />
          <Route path="/app/training" element={<Training />} />
          <Route path="/app/training/:tab" element={<Training />} />
          <Route path="/app/practise" element={<Practise />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app/settings/:tab" element={<Settings />} />
          <Route path="/app/number" element={<Number />} />
          <Route path="/app/calls" element={<Calls />} />
          <Route path="/app/tenants" element={<Tenants />} />
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
