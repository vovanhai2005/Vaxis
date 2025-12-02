import React, { useState, useEffect } from 'react'
import { Info, Calendar, Loader2, ShoppingCartIcon, Trash2, User, Mail, Phone, ShieldCheck, Check, CalendarPlus } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUserStore } from '../../store/useUserStore'
import { useAppointmentStore } from '../../store/useAppointmentStore'
import { useVaccineStore } from '../../store/useVaccineStore'
import DateTimePicker from '../../components/DateTimePicker'
import Header from '../../components/Header'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30">
      <Header 
        title="Book Appointment" 
        subtitle="Schedule your vaccination appointment"
        icon={CalendarPlus}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
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
              className="w-full p-3 rounded-lg focus:outline-none border-2 border-gray-400 ring-2 ring-transparent focus:border-teal-600 focus:ring-teal-200 bg-white text-gray-900 placeholder-gray-500"
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
              disabled={!appointmentDate || selectedVaccines.length === 0}
              className="w-full bg-white text-teal-600 font-bold py-4 rounded-lg text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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