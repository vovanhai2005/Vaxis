import React, { useState, useEffect } from 'react'
import { Search, ShoppingCart, Bell, Info, Calendar, Loader2, ShoppingCartIcon, Trash2, User, Mail, Phone, ShieldCheck, MapPin, Check } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUserStore } from '../../store/useUserStore'
import { useAppointmentStore } from '../../store/useAppointmentStore'
import { useVaccineStore } from '../../store/useVaccineStore'
import DateTimePicker from '../../components/DateTimePicker'

const Section = ({ icon, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-sm mb-6">
    <div className="px-8 py-4 flex items-center gap-4 border-b border-gray-100">
      <div className="bg-teal-100 p-3 rounded-lg">
        {React.cloneElement(icon, { className: 'h-6 w-6 text-teal-600' })}
      </div>
      <div>
        <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
    <div className="p-8">
      {children}
    </div>
  </div>
)

const InfoField = ({ icon, label, value }) => (
  <div>
    <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
      {React.cloneElement(icon, { className: 'h-4 w-4' })}
      {label}
    </label>
    <p className="text-gray-800 font-medium bg-gray-50 p-3 rounded-lg">{value || 'Not provided'}</p>
  </div>
)

const BookingPage = () => {
  const { authUser } = useAuthStore()
  const { userProfile, getCitizenProfile } = useUserStore()
  const { makeAppointment } = useAppointmentStore()
  const { selectedVaccines, totalCost, removeVaccineFromCart } = useVaccineStore()

  const [appointmentDate, setAppointmentDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    getCitizenProfile()
  }, [getCitizenProfile])

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Book Appointment</h1>
          <p className="text-gray-500">Schedule your vaccination appointment</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ShoppingCart className="h-6 w-6 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
            <Bell className="h-6 w-6 text-gray-600" />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </button>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{authUser?.full_name || authUser?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{authUser?.role || 'Patient'}</p>
            </div>
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(authUser?.full_name || authUser?.username || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Book Your Vaccination Appointment</h2>
          <p className="text-gray-500 mt-1">Fill in your details below to schedule your vaccination appointment</p>
        </div>

        {/* Personal Information */}
        <Section
          icon={<User />}
          title="Personal Information"
          subtitle="Please provide your details for the appointment"
        >
          <div className="grid grid-cols-2 gap-6">
            <InfoField icon={<User />} label="Full Name" value={userProfile?.full_name} />
            <InfoField icon={<Calendar />} label="Date of Birth" value={formatDate(userProfile?.dob)} />
            <InfoField icon={<Mail />} label="Email Address" value={userProfile?.email} />
            <InfoField icon={<Phone />} label="Phone Number" value={userProfile?.phone} />
          </div>
        </Section>

        {/* Selected Vaccines */}
        <Section
          icon={<ShieldCheck />}
          title="Selected Vaccines"
          subtitle="Review your vaccine selections"
        >
          {selectedVaccines.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-700">No vaccines selected yet.</h4>
              <p className="text-gray-500 text-sm">Please add vaccines from the Vaccination Info page.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedVaccines.map(vaccine => (
                <div key={vaccine.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <img src={vaccine.image_url || '/src/asset/vaccine_demo.png'} alt={vaccine.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-semibold text-gray-800">{vaccine.name}</h4>
                      <p className="text-sm text-gray-500">{vaccine.disease_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="font-semibold text-gray-800">${parseFloat(vaccine.price).toFixed(2)}</p>
                    <button onClick={() => removeVaccineFromCart(vaccine.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Appointment Details */}
        <Section
          icon={<Calendar />}
          title="Appointment Details"
          subtitle="Choose your preferred date and add any notes"
        >
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Calendar className="h-4 w-4" />
                Preferred Appointment Date
              </label>
              <DateTimePicker
                value={appointmentDate}
                onChange={(date) => setAppointmentDate(date)}
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Info className="h-4 w-4" />
              Additional Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Any special requests or information..."
              className="w-full p-3 rounded-lg focus:outline-none border-gray-300 ring-2 ring-transparent focus:border-teal-500 focus:ring-teal-100 bg-white"
            />
          </div>
        </Section>

        {/* Booking Summary */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-lg">Ready to book?</p>
              <p className="opacity-90">Complete your appointment booking</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Total Cost</p>
              <p className="text-3xl font-bold">${totalCost.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/20">
            <button
              onClick={() => makeAppointment(appointmentDate, notes)}
              className="w-full bg-white text-teal-600 font-bold py-4 rounded-lg text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Check className="h-6 w-6" />
              Confirm & Submit Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage