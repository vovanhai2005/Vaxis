import React from 'react'
import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Eye, EyeOff, Loader2, Shield, Syringe, CheckCircle, Calendar, FileText, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const SignUpPage = () => {
  const [isShowPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.username.trim()) return toast.error('Username is required');
    if (!formData.email.trim()) return toast.error('Email is required');
    if (!formData.email.includes('@')) return toast.error('Please enter a valid email address');
    if (!formData.password.trim()) return toast.error('Password is required');
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters long');
    return true;
  }

  const handleSignUp = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) signup(formData);
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
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Vaxis</span> Today
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Create your account and take control of your vaccination journey with our comprehensive healthcare platform.
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-4 text-left mb-8">
            <div className="flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-teal-200 shadow-sm">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Easy Appointment Booking</h3>
                <p className="text-gray-600 text-sm">Schedule your vaccinations at your convenience with our simple booking system.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-teal-200 shadow-sm">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Digital Health Records</h3>
                <p className="text-gray-600 text-sm">Access your complete vaccination history and certificates anytime, anywhere.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-teal-200 shadow-sm">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Secure & Private</h3>
                <p className="text-gray-600 text-sm">Your health data is protected with enterprise-grade security measures.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right field - Sign Up Form */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md lg:w-[480px] p-8 lg:p-10 border border-gray-100">  
        {/* Mobile Logo */}
        <div className="lg:hidden flex justify-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg shadow-teal-500/30">
            <Syringe className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-500">Start your health journey with Vaxis</p>
        </div>
        
        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input 
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:outline-none focus:border-teal-500 focus:bg-white transition-all" 
                type="text" 
                placeholder='Choose a username' 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:outline-none focus:border-teal-500 focus:bg-white transition-all" 
                type="email" 
                placeholder='Enter your email' 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  placeholder='Create a strong password' 
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
              <p className="text-xs text-gray-500 mt-1.5">Minimum 6 characters required</p>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
            disabled={isSigningUp}
          >
            {isSigningUp ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Create Account
              </>
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Sign in to your account{' '}
              <a href="/login" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline transition">
                Login Here
              </a>
            </p>
          </div>
        </form>

      </div>
    </div>
  )
}

export default SignUpPage;