import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUserStore } from '../../store/useUserStore'
import { User, ChevronDown, ChevronUp, Mail, Phone, Calendar, Loader2, Camera, UserCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '../../components/Header'

const ProfilePage = () => {
  const { authUser } = useAuthStore()
  const { employeeProfile, getEmployeeProfile, updateEmployeeProfile, isLoadingProfile, isUpdatingProfile } = useUserStore()
  
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    dob: '',
    employeeNumber: '',
    roleTitle: '',
    national_id: ''
  })

  useEffect(() => {
    getEmployeeProfile()
  }, [getEmployeeProfile])

  useEffect(() => {
    if (employeeProfile) {
      setFormData({
        fullname: employeeProfile.full_name || '',
        email: employeeProfile.email || '',
        phone: employeeProfile.phone || '',
        dob: employeeProfile.dob || '',
        employeeNumber: employeeProfile.employee_number || '',
        roleTitle: employeeProfile.role_title || '',
        national_id: employeeProfile.national_id || ''
      })
    }
  }, [employeeProfile])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSaveProfile = async () => {
    const dataToUpdate = {
      fullname: formData.fullname,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      employeeNumber: formData.employeeNumber,
      roleTitle: formData.roleTitle,
      national_id: formData.national_id,
      profilePicture: formData.profile_picture_preview || null
    }
    const success = await updateEmployeeProfile(dataToUpdate)
    if (success) {
      setIsEditing(false)
      getEmployeeProfile()
    }
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target.result
      setFormData(prev => ({ ...prev, profile_picture_preview: base64 }))

      if (!isEditing) {
        const success = await updateEmployeeProfile({ profilePicture: base64 })
        if (success) {
          toast.success('Profile picture updated')
          getEmployeeProfile()
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30 pb-10">
      <Header 
        title="Employee Profile" 
        subtitle="Manage your personal information"
        icon={UserCircle}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-t-3xl p-8 pb-16 relative" />

        <div className="bg-white px-8 py-6 border-b relative">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg -mt-20 border-4 border-white relative z-10">
              {isLoadingProfile ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <img
                    src={formData.profile_picture_preview || employeeProfile?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullname || authUser?.username || 'U')}&background=0d9488&color=fff&size=96`}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <button
                    onClick={() => document.getElementById('profilePictureInput').click()}
                    className="absolute bottom-0 right-0 bg-white text-teal-600 p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                    aria-label="Change profile picture"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    type="file"
                    id="profilePictureInput"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </>
              )}
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{formData.fullname || authUser?.username}</h2>
                <div className="flex items-center gap-4 text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{formData.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="ml-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-teal-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-teal-600 transition flex items-center gap-2"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-white text-gray-600 px-3 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                      disabled={isUpdatingProfile}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="bg-teal-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-teal-600 transition flex items-center gap-2"
                      disabled={isUpdatingProfile}
                    >
                      {isUpdatingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-3xl shadow-sm mb-6">
          <button
            onClick={() => setIsBasicInfoExpanded(!isBasicInfoExpanded)}
            className="w-full px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Basic Information</h3>
                <p className="text-sm text-gray-500">Your personal details and contact information</p>
              </div>
            </div>
            {isBasicInfoExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {isBasicInfoExpanded && (
            <div className="px-8 pb-6 grid grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border-teal-500 ring-2 ring-teal-100 bg-white focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{formData.fullname || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border-teal-500 ring-2 ring-teal-100 bg-white focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{formatDate(formData.dob)}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <User className="h-4 w-4" />
                  Employee Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="employeeNumber"
                    value={formData.employeeNumber}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border-teal-500 ring-2 ring-teal-100 bg-white focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{formData.employeeNumber || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <User className="h-4 w-4" />
                  Role Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="roleTitle"
                    value={formData.roleTitle}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border-teal-500 ring-2 ring-teal-100 bg-white focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{formData.roleTitle || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <User className="h-4 w-4" />
                  National ID
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="national_id"
                    value={formData.national_id}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border-teal-500 ring-2 ring-teal-100 bg-white focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{formData.national_id || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border-teal-500 ring-2 ring-teal-100 bg-white focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{formData.email}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border-teal-500 ring-2 ring-teal-100 bg-white focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{formData.phone || 'Not provided'}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
