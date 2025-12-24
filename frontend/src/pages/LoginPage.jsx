import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Eye, EyeOff, Loader2, Shield, Syringe, Heart, Users } from 'lucide-react'

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
      <div className="flex items-center justify-center h-full px-4 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        {/* Left field - Hero Section */}
        <div className="hidden lg:flex flex-col items-center justify-center h-full w-1/2 p-12">
          <div className="max-w-xl text-center">
            {/* Logo and Title */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-6 shadow-2xl shadow-teal-500/30">
                <Syringe className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Vaxis</span>
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Your trusted platform for comprehensive vaccination management and healthcare services.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-teal-200 shadow-sm">
                <Shield className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <h3 className="text-gray-900 font-semibold mb-1">Secure & Safe</h3>
                <p className="text-gray-600 text-sm">Protected health records</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-teal-200 shadow-sm">
                <Heart className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <h3 className="text-gray-900 font-semibold mb-1">Health First</h3>
                <p className="text-gray-600 text-sm">Expert care & support</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-teal-200 shadow-sm">
                <Syringe className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <h3 className="text-gray-900 font-semibold mb-1">Easy Booking</h3>
                <p className="text-gray-600 text-sm">Schedule in minutes</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-teal-200 shadow-sm">
                <Users className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <h3 className="text-gray-900 font-semibold mb-1">For Everyone</h3>
                <p className="text-gray-600 text-sm">All ages welcome</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 text-gray-900">
              <div>
                <p className="text-3xl font-bold text-teal-600">50K+</p>
                <p className="text-sm text-gray-600">Vaccinations</p>
              </div>
              <div className="w-px bg-gray-300"></div>
              <div>
                <p className="text-3xl font-bold text-teal-600">10K+</p>
                <p className="text-sm text-gray-600">Happy Users</p>
              </div>
              <div className="w-px bg-gray-300"></div>
              <div>
                <p className="text-3xl font-bold text-teal-600">99%</p>
                <p className="text-sm text-gray-600">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right field - Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md lg:w-[480px] p-8 lg:p-10 border border-gray-100">  
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg shadow-teal-500/30">
              <Syringe className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Sign in to access your vaccination records</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input 
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:outline-none focus:border-teal-500 focus:bg-white transition-all" 
                  type="text" 
                  placeholder='Enter your username' 
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
  
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:outline-none focus:border-teal-500 focus:bg-white transition-all" 
                    type={isShowPassword ? 'text' : 'password'}
                    placeholder='Enter your password' 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                    onClick={() => setShowPassword(!isShowPassword)}
                  >
                    {isShowPassword ? (
                      <EyeOff className="h-5 w-5"/>
                    ): (
                      <Eye className="h-5 w-5"/>
                    )}
                  </button>
                </div> 
              </div>
            </div>
  
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">New to Vaxis?</span>
              </div>
            </div>
  
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <a href="/signup" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline transition">
                  Create Account
                </a>
              </p>
            </div>
          </form>
  
        </div>
      </div>
    )
}

export default LoginPage;
