import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { MasterDataProvider } from './context/MasterDataContext'
import ProtectedRoute from './components/ProtectedRoute'
import Splash from './pages/Splash'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Scanner from './pages/Scanner'
import Review from './pages/Review'
import Dashboard from './pages/Dashboard'
import MasterGroup from './pages/MasterGroup'
import GroupDetail from './pages/GroupDetail'
import GroupMonitor from './pages/GroupMonitor'
import LiveMonitor from './pages/LiveMonitor'
import Laporan from './pages/Laporan'
import Pengaturan from './pages/Pengaturan'

function MasterDataScope() {
  return (
    <MasterDataProvider>
      <Outlet />
    </MasterDataProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={<Splash />}
          />

          <Route
            path="/landing"
            element={<Landing />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/monitor/public/:monitorToken"
            element={<GroupMonitor />}
          />

          <Route element={<MasterDataScope />}>
            <Route
              path="/scanner"
              element={<Scanner />}
            />

            <Route
              path="/review"
              element={<Review />}
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/master-group"
              element={
                <ProtectedRoute>
                  <MasterGroup />
                </ProtectedRoute>
              }
            />

            <Route
              path="/group/:groupId"
              element={
                <ProtectedRoute>
                  <GroupDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/live"
              element={
                <ProtectedRoute>
                  <LiveMonitor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/laporan"
              element={
                <ProtectedRoute>
                  <Laporan />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pengaturan"
              element={
                <ProtectedRoute>
                  <Pengaturan />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="*"
            element={
              <div
                className="min-h-screen bg-white"
                aria-hidden="true"
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}