import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F4F7F6] px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#D8E5E0] border-t-[#013220]" />

          <p className="mt-4 text-sm font-medium text-[#475569]">
            Memeriksa sesi admin...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return children
}