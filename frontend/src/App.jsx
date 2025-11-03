import Navbar from './components/Navbar'
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'

import { useAuthStore } from './store/useAuthStore'

import { Loader } from 'lucide-react'
import { Toaster } from 'react-hot-toast'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore()

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-gray-200">
        <Loader className="animate-spin size-10 text-blue-400"></Loader>
      </div>
    )
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="flex h-full w-full">
        {/* Left sidebar - Navbar with fixed width */}
        {authUser && (
          <div className="h-full w-20 flex-shrink-0">
            <Navbar />
          </div>
        )}
        
        {/* Main content area - takes exactly remaining space */}
        <div className={`flex-1 overflow-y-auto ${authUser ? 'w-[calc(100%-5rem)]' : 'w-full'}`}>
          <Routes>
            <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
            <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          </Routes>
        </div>
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