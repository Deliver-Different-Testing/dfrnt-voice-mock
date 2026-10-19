import { Route, Routes, Navigate } from 'react-router-dom'
import { Shell } from './components/Shell'
import Landing from './pages/Landing'
import VoiceAgent from './pages/VoiceAgent'
import Simulator from './pages/Simulator'
import ThreeCx from './pages/ThreeCx'

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/voice-agent" element={<VoiceAgent />} />
        <Route path="/voice-agent/:tab" element={<VoiceAgent />} />
        <Route path="/3cx" element={<ThreeCx />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/simulator/:scenario" element={<Simulator />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}
