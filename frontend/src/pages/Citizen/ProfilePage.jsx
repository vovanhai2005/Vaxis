import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUserStore } from '../../store/useUserStore'
import { useVaccineStore } from '../../store/useVaccineStore'
import { User, ChevronDown, ChevronUp, Mail, Phone, MapPin, Droplet, Calendar, Syringe, MapPinIcon, Loader2, Camera, UserCircle, ChevronRight, Download, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import AppointmentDetailModal from '../../components/AppointmentDetailModal'
import VaccinationCertificateTemplate from '../../components/VaccinationCertificateTemplate'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

const ProfilePage = () => {
  const navigate = useNavigate()
  const certificateRef = useRef()
  const { authUser } = useAuthStore()
  const { userProfile, appointmentHistory, getCitizenProfile, getAppointmentHistory, updateCitizenProfile, isLoadingProfile, isLoadingHistory, isUpdatingProfile } = useUserStore()
  const { selectedVaccines } = useVaccineStore()
  
  const [isBasicInfoExpanded, setIsBasicInfoExpanded] = useState(true)
  const [isAppointmentHistoryExpanded, setIsAppointmentHistoryExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  
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
    getAppointmentHistory()
  }, [getAppointmentHistory])

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

  const [certificateAppointment, setCertificateAppointment] = useState(null)

  const handleDownloadCertificate = (appointment) => {
    setCertificateAppointment(appointment)
    // Allow time for the hidden component to re-render with new data
    setTimeout(() => {
      generatePDF(appointment)
    }, 500)
  }

  const generatePDF = async (appointment) => {
    const element = certificateRef.current
    if (!element) return

    const toastId = toast.loading('Generating Certificate...')

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        windowWidth: 794, // A4 width in px at 96dpi approx
        windowHeight: 1123,
        backgroundColor: '#ffffff' // Force white background to avoid oklch errors
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Vaxis_Certificate_Appointment_${appointment.id}_${userProfile?.full_name || 'User'}.pdf`)
      toast.success('Certificate downloaded', { id: toastId })
    } catch (error) {
      console.error('PDF Generation Error:', error)
      toast.error('Failed to generate PDF', { id: toastId })
    }
  }

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
      gender: formData.gender,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30">
      <Header 
        title="My Profile" 
        subtitle="Manage your personal information and vaccination records"
        icon={UserCircle}
      />

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
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
                  <User className="h-4 w-4" />
                  Gender
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg focus:outline-none ${isEditing ? 'border-teal-500 ring-2 ring-teal-100 bg-white' : 'border-gray-300'}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-gray-800 font-medium capitalize">{formData.gender || 'Not provided'}</p>
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
                    className={`w-full p-3 rounded-lg focus:outline-none ${isEditing ? 'border-teal-500 ring-2 ring-teal-100 bg-white' : 'border-gray-300'}`}
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{formData.national_id || 'Not provided'}</p>
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
                    disabled
                    className="w-full p-3 rounded-lg border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
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

              <div>
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
            </div>
          )}
        </div>

        {/* Vaccination History Section */}
        <div className="bg-white rounded-3xl shadow-sm">
          <button
            onClick={() => setIsAppointmentHistoryExpanded(!isAppointmentHistoryExpanded)}
            className="w-full px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition rounded-t-3xl"
          >
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg">
                <Syringe className="h-5 w-5 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Appointment History</h3>
                <p className="text-sm text-gray-500">Your completed vaccination appointments</p>
              </div>
            </div>
            {isAppointmentHistoryExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {isAppointmentHistoryExpanded && (
            <div className="px-8 pb-6">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                </div>
              ) : appointmentHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Syringe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No completed appointments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointmentHistory.map((appointment, index) => {
                    const vaccines = appointment.vaccines || []
                    const vaccineCount = vaccines.length
                    return (
                      <div key={index} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                              <Syringe className="h-6 w-6 text-teal-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 text-lg">Appointment #{appointment.id}</h4>
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                                  Completed
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 font-medium">{vaccineCount} Vaccine{vaccineCount !== 1 ? 's' : ''} Administered</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span>{formatDate(appointment.scheduled_at)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                                  <span>Vaxis Center</span>
                                </div>
                              </div>
                              {vaccines.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {vaccines.slice(0, 2).map((vaccine, vIdx) => (
                                    <span key={vIdx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                                      {vaccine.name}
                                    </span>
                                  ))}
                                  {vaccines.length > 2 && (
                                    <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-md font-medium">
                                      +{vaccines.length - 2} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 pl-16 md:pl-0 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                            <button 
                              onClick={() => handleDownloadCertificate(appointment)}
                              className="p-2.5 bg-gray-50 hover:bg-teal-50 text-gray-700 hover:text-teal-700 rounded-lg border border-gray-200 hover:border-teal-200 transition-all group/btn"
                              title="Download Certificate"
                            >
                              <Download className="h-4 w-4 text-gray-400 group-hover/btn:text-teal-500 transition-colors" />
                            </button>
                            <button 
                              onClick={() => setSelectedAppointment(appointment)}
                              className="flex-1 md:flex-none px-4 py-2.5 bg-gray-50 hover:bg-teal-50 text-gray-700 hover:text-teal-700 font-medium rounded-lg border border-gray-200 hover:border-teal-200 transition-all flex items-center justify-center gap-2 group/btn"
                            >
                              View Details
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover/btn:text-teal-500 transition-colors" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal 
          appointment={selectedAppointment} 
          onClose={() => setSelectedAppointment(null)} 
        />
      )}

      {/* Help Button */}
      <button className="fixed bottom-8 right-8 bg-gray-800 hover:bg-gray-900 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition">
        <span className="text-xl">?</span>
      </button>

      {/* Hidden Certificate Template for PDF Generation */}
      <VaccinationCertificateTemplate 
        ref={certificateRef}
        userProfile={userProfile}
        appointment={certificateAppointment}
      />

      {/* Help Button */}
      <button className="fixed bottom-6 right-6 bg-gray-900 hover:bg-gray-800 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 group">
        <span className="text-xl font-medium">?</span>
        <span className="absolute right-full mr-3 bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Need help?
        </span>
      </button>
    </div>
  )
}

export default ProfilePage