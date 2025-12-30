import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { User, Calendar, Phone, CreditCard, Loader2, Syringe, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { axiosInstance } from '../lib/axios'

const CompleteProfilePage = () => {
  const { authUser, checkAuth } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    dob: '',
    phone: ''
  })

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required')
      return false
    }
    if (!formData.nationalId.trim()) {
      toast.error('National ID is required')
      return false
    }
    if (!formData.dob) {
      toast.error('Date of birth is required')
      return false
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required')
      return false
    }
    // Basic phone validation
    const phoneRegex = /^[0-9+\-\s()]{8,20}$/
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid phone number')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await axiosInstance.post('/auth/complete-profile', {
        fullName: formData.fullName,
        nationalId: formData.nationalId,
        dob: formData.dob,
        phone: formData.phone
      })
      
      toast.success('Profile completed successfully!')
      // Refresh auth to get updated profile status
      await checkAuth()
      window.location.href = '/'
    } catch (error) {
      console.error('Error completing profile:', error)
      toast.error(error.response?.data?.message || 'Failed to complete profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Left field - Welcome Section */}
      <div className="hidden lg:flex flex-col items-center justify-center h-full w-1/2 p-12">
        <div className="max-w-xl text-center">
          {/* Logo and Title */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-6 shadow-2xl shadow-teal-500/30">
              <Syringe className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Vaxis</span>!
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Just one more step! Please complete your profile to start using all our services.
            </p>
          </div>

          {/* Info Cards */}
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-teal-200 shadow-sm">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Why do we need this?</h3>
                <p className="text-gray-600 text-sm">Your information helps us provide personalized vaccination services and maintain accurate health records.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-teal-200 shadow-sm">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Your National ID</h3>
                <p className="text-gray-600 text-sm">Used to verify your identity and link your vaccination records securely.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right field - Complete Profile Form */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md lg:w-[480px] p-8 lg:p-10 border border-gray-100">
        {/* Mobile Logo */}
        <div className="lg:hidden flex justify-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg shadow-teal-500/30">
            <Syringe className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-500">Hi {authUser?.username}! Please fill in your details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  National ID <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                type="text"
                name="nationalId"
                placeholder="Enter your National ID"
                value={formData.nationalId}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Profile'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          All fields are required to access the platform
        </p>
      </div>
    </div>
  )
}

export default CompleteProfilePage
