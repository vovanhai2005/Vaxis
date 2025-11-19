import Navbar from './components/Navbar'
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/Citizen/DashboardPage'
import ProfilePage from './pages/Citizen/ProfilePage'

import { useAuthStore } from './store/useAuthStore'

import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  console.log( authUser ? "True" : "False");

  if (isCheckingAuth && !authUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-gray-200">
        <Loader className="animate-spin size-10 text-blue-400"></Loader>
      </div>
    )
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {authUser && <Navbar />}
      
      {/* Main content area - takes exactly remaining space */}
      <div className={`h-full overflow-y-auto ${authUser ? 'ml-64' : 'w-full'}`}>
        <Routes>
          <Route path="/" element={!authUser ? <Navigate to="/login" /> : <DashboardPage />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <DashboardPage />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <DashboardPage />} />
          <Route path="/profile/:id?" element={!authUser ? <Navigate to="/login" /> : <ProfilePage />} />
        </Routes>
      </div>
      
      <Toaster 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          }
        }}
      />
    </div>
  )
}

export default App