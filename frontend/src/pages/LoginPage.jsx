import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const LoginPage = () => {
  const [isShowPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  const { login, isLoggingIn } = useAuthStore()

  const handleLogin = (e) => {
    e.preventDefault()
    login(formData)
  }

  return (
      <div className="flex items-center justify-end h-full">
        {/* Left field */}
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center p-8">
            <h1 className="text-6xl font-bold text-white mb-4">Welcome to Vibe!</h1>
            <p className="text-lg text-white">
              Join us and start connecting with your friends. Create an account to get started!
            </p>
            <img 
              src="/Pin.png" 
              alt="" 
              className="mt-12 mx-auto w-3/4 rounded-lg"
            />  
          </div>
        </div>
        {/* Right field */}
        <div className="bg-white rounded-[5%] shadow-xl w-[700px] h-[600px] p-5">  
          <h2 className="text-4xl font-bold text-center mt-6 mb-8">Log In</h2>
          <form onSubmit={handleLogin} className="flex flex-col items-center">
            <div className="register-form flex-col w-full space-y-4 p-8">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Username</span>
                </label>
                <input 
                  className="w-full justify-center p-3 rounded-2xl border border-gray bg-white focus:outline-none focus:border-black" 
                  type="text" 
                  placeholder='Username' 
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
                  
              </div>
  
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <input 
                    className="w-full justify-center p-3 rounded-2xl border border-gray bg-white focus:outline-none focus:border-black" 
                    type={isShowPassword ? 'text' : 'password'}
                    placeholder='Password' 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!isShowPassword)}
                  >
                    {isShowPassword ? (
                      <EyeOff className="size-5 text-base-content/40"/>
                    ): (
                      <Eye className="size-5 text-base-content/40"/>
                    )}
                  </button>
                </div> 
              </div>
  
              
  
              <div className="pt-6">
                <button 
                  type="submit" 
                  className="btn btn-primary w-full" 
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>
              </div>
            </div>
  
            <div className="text-center text-sm text-gray-500">
              Don't have an account? <a href="/signup" className="text-blue-500 hover:underline">Sign Up</a>
            </div>
  
          </form>
  
        </div>
      </div>
    )
}

export default LoginPage;
