import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MasterDataProvider } from './context/MasterDataContext'
import Splash from './pages/Splash'
import Landing from './pages/Landing'
import Scanner from './pages/Scanner'
import Review from './pages/Review'
import Dashboard from './pages/Dashboard'
import MasterGroup from './pages/MasterGroup'
import GroupMonitor from './pages/GroupMonitor'
import LiveMonitor from './pages/LiveMonitor'
import Laporan from './pages/Laporan'
import Pengaturan from './pages/Pengaturan'

export default function App() {
  return (
    <MasterDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/review" element={<Review />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/master-group" element={<MasterGroup />} />
          <Route path="/monitor/group/:groupId" element={<GroupMonitor />} />
          <Route path="/live" element={<LiveMonitor />} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MasterDataProvider>
  )
}
