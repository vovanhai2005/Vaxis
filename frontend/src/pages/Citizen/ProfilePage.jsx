import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUserStore } from '../../store/useUserStore'
import { useVaccineStore } from '../../store/useVaccineStore'
import { User, ChevronDown, ChevronUp, Mail, Phone, MapPin, Droplet, Calendar, Syringe, MapPinIcon, Loader2, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { authUser } = useAuthStore()
  const { userProfile, vaccineHistory, getCitizenProfile, getVaccineHistory, updateCitizenProfile, isLoadingProfile, isLoadingHistory, isUpdatingProfile } = useUserStore()
  const { selectedVaccines } = useVaccineStore()
  
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true)
  const [isVaccineHistoryExpanded, setIsVaccineHistoryExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    dob: '',
    address: '',
    bloodType: '',
    gender: '',
    national_id: ''
  })
  const [profilePictureFile, setProfilePictureFile] = useState(null)

  useEffect(() => {
    getVaccineHistory()
  }, [getVaccineHistory])

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullname: userProfile.full_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        dob: userProfile.dob || '',
        address: userProfile.address || '',
        bloodType: userProfile.blood_type || '',
        gender: userProfile.gender || '',
        national_id: userProfile.national_id || ''
      })
    }
  }, [userProfile])

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
      address: formData.address,
      bloodType: formData.bloodType,
      national_id: formData.national_id,
      // send base64 preview string if available (backend will upload to Cloudinary)
      profilePicture: formData.profile_picture_preview || null
    }
    const success = await updateCitizenProfile(dataToUpdate)
    if (success) {
      setIsEditing(false)
      setProfilePictureFile(null)
      getCitizenProfile()
    }
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target.result
      // Set preview for UI
      setFormData(prev => ({ ...prev, profile_picture_preview: base64 }))

      // If user is not in edit mode, save immediately
      if (!isEditing) {
        // Call store to update profile picture only
        const success = await updateCitizenProfile({ profilePicture: base64 })
        if (success) {
          toast.success('Profile picture updated')
          getCitizenProfile()
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

  const getVaccineStatusColor = (status) => {
    if (status === 'Completed') return 'bg-green-100 text-green-600'
    if (status === 'Upcoming') return 'bg-blue-100 text-blue-600'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Header 
        title="My Profile" 
        subtitle="Manage your personal information and vaccination records"
      />

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-t-3xl p-8 pb-16 relative" />

        {/* Profile Avatar and Name */}
        <div className="bg-white px-8 py-6 border-b relative">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg -mt-20 border-4 border-white relative z-10">
              {isLoadingProfile ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <img
                    src={formData.profile_picture_preview || userProfile?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullname || authUser?.username || 'U')}&background=0d9488&color=fff&size=96`}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <>
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

        {/* Basic Information Section */}
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
                    className={`w-full p-3 rounded-lg focus:outline-none ${isEditing ? 'border-teal-500 ring-2 ring-teal-100 bg-white' : 'border-gray-300'}`}
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
                    className={`w-full p-3 rounded-lg focus:outline-none ${isEditing ? 'border-teal-500 ring-2 ring-teal-100 bg-white' : 'border-gray-300'}`}
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{formatDate(formData.dob)}</p>
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
                    className={`w-full p-3 rounded-lg focus:outline-none ${isEditing ? 'border-teal-500 ring-2 ring-teal-100 bg-white' : 'border-gray-300'}`}
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
                    className={`w-full p-3 rounded-lg focus:outline-none ${isEditing ? 'border-teal-500 ring-2 ring-teal-100 bg-white' : 'border-gray-300'}`}
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{formData.phone || 'Not provided'}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg focus:outline-none ${isEditing ? 'border-teal-500 ring-2 ring-teal-100 bg-white' : 'border-gray-300'}`}
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{formData.address || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Droplet className="h-4 w-4" />
                  Blood Type
                </label>
                {isEditing ? (
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg focus:outline-none ${isEditing ? 'border-teal-500 ring-2 ring-teal-100 bg-white' : 'border-gray-300'}`}
                  >
                    <option value="">Select Blood Type</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                ) : (
                  <p className="text-gray-800 font-medium">{formData.bloodType || 'Not provided'}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vaccination History Section */}
        <div className="bg-white rounded-3xl shadow-sm">
          <button
            onClick={() => setIsVaccineHistoryExpanded(!isVaccineHistoryExpanded)}
            className="w-full px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition rounded-t-3xl"
          >
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg">
                <Syringe className="h-5 w-5 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Vaccination History</h3>
                <p className="text-sm text-gray-500">Your complete vaccination records</p>
              </div>
            </div>
            {isVaccineHistoryExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {isVaccineHistoryExpanded && (
            <div className="px-8 pb-6">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                </div>
              ) : vaccineHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Syringe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No vaccination records found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vaccineHistory.map((vaccine, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{vaccine.vaccine_name}</h4>
                          <p className="text-sm text-gray-600">{vaccine.manufacturer}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getVaccineStatusColor('Completed')}`}>
                          Completed
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Date: {formatDate(vaccine.administered_at)}</span>
                      </div>
                      {vaccine.dose_number && (
                        <div className="mt-2 text-sm text-gray-600">
                          Dose #{vaccine.dose_number}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Help Button */}
      <button className="fixed bottom-8 right-8 bg-gray-800 hover:bg-gray-900 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition">
        <span className="text-xl">?</span>
      </button>
    </div>
  )
}

export default ProfilePage