import Navbar from './components/Navbar'
import AIChatbot from './components/AIChatbot'
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
import EmployeeDashboardPage from './pages/Employee/DashboardPage'
import UpcomingAppointmentsPage from './pages/Employee/UpcomingAppointmentsPage'
import VaccineStockPage from './pages/Employee/VaccineStockPage'
import EmployeeProfilePage from './pages/Employee/ProfilePage'
import ManagerDashboardPage from './pages/Manager/DashboardPage'
import StaffManagementPage from './pages/Manager/StaffManagementPage'
import CategoriesVaccinePage from './pages/Manager/CategoriesVaccinePage'
import VaccineLotsManagementPage from './pages/Manager/VaccineLotsManagementPage'
import VaccinationStatsPage from './pages/Manager/VaccinationStatsPage'
import AnnouncementsPage from './pages/Manager/AnnouncementsPage'
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
    if (authUser && authUser.role !== 'manager') {
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
          <Route path="/" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'citizen' ? <DashboardPage /> : authUser.role === 'employee' ? <EmployeeDashboardPage /> : authUser.role === 'manager' ? <Navigate to="/manager" /> :<Navigate to="/login" />} />
          <Route path="/profile/:id?" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'citizen' ? <ProfilePage /> : authUser.role === 'employee' ? <EmployeeProfilePage /> : <Navigate to="/login" />} />
          <Route path="/booking" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'citizen' ? <BookingPage /> : <Navigate to="/login" />} />
          <Route path="/appointment" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'citizen' ? <AppointmentPage /> : <Navigate to="/login" />} />
          <Route path="/vaccination-info" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'citizen' ? <VaccinationInfoPage /> : <Navigate to="/login" />} />
          
          {/* Employee Routes */}
          <Route path="/lookup-citizen" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'employee' ? <LookupCitizenProfilePage /> : <Navigate to="/login" />} />
          <Route path="/upcoming-appointments" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'employee' ? <UpcomingAppointmentsPage /> : <Navigate to="/login" />} />
          <Route path="/vaccine-stock" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'employee' ? <VaccineStockPage /> : <Navigate to="/login" />} />
          <Route path="/profile/:id?" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'employee' ? <EmployeeProfilePage /> : <Navigate to="/login" />} />
        
         {/* Manager Routes */}
          <Route path="/manager" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'manager' ? <ManagerDashboardPage /> : <Navigate to="/login" />} />
          <Route path="/staff-management" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'manager' ? <StaffManagementPage /> : <Navigate to="/login" />} />
          <Route path="/categories-management" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'manager' ? <CategoriesVaccinePage /> : <Navigate to="/login" />} />
          <Route path="/vaccineLots-management" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'manager' ? <VaccineLotsManagementPage /> : <Navigate to="/login" />} />
          <Route path="/vaccination-stats" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'manager' ? <VaccinationStatsPage /> : <Navigate to="/login" />} />
          <Route path="/announcements" element={!authUser ? <Navigate to="/login" /> : authUser.role === 'manager' ? <AnnouncementsPage /> : <Navigate to="/login" />} />
        </Routes>
      </div>
      
      {/* AI Chatbot - available for authenticated users */}
      {authUser && <AIChatbot />}
      
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