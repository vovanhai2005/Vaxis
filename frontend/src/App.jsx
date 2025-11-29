import Navbar from './components/Navbar'
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/Citizen/DashboardPage'
import ProfilePage from './pages/Citizen/ProfilePage'
import BookingPage from './pages/Citizen/BookingPage'
import AppointmentPage from './pages/Citizen/AppointmentPage'
import VaccinationInfoPage from './pages/Citizen/VaccinationInfoPage'
import LookupCitizenProfilePage from './pages/Employee/LookupCitizenProfilePage'


import { useAuthStore } from './store/useAuthStore'
import { useUserStore } from './store/useUserStore'

import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
  const { getCitizenProfile } = useUserStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      getCitizenProfile()
    }
  }, [authUser, getCitizenProfile]);

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
          {/* Public Routes */}
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          
          {/* Citizen Routes */}
          <Route path="/" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'citizen' || authUser.role === 'employee' ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/profile/:id?" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'citizen' ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/booking" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'citizen' ? <BookingPage /> : <Navigate to="/login" />} />
          <Route path="/appointment" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'citizen' ? <AppointmentPage /> : <Navigate to="/login" />} />
          <Route path="/vaccination-info" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'citizen' ? <VaccinationInfoPage /> : <Navigate to="/login" />} />
          
          {/* Employee Routes */}
          <Route path="/lookup-citizen" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'employee' ? <LookupCitizenProfilePage /> : <Navigate to="/login" />} />
          <Route path="/profile/:id?" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'employee' ? <ProfilePage /> : <Navigate to="/login" />} />
        
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