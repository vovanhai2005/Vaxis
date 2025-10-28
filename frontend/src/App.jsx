import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { SignUpPage } from './pages/SignUpPage.jsx'

import { Toaster } from 'react-hot-toast'

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore()

  console.log({ onlineUsers });

  console.log({ authUser });

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