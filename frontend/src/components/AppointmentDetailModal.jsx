import React, { useState } from 'react'
import { Calendar, Clock, Loader2, CheckCircle, XCircle, AlertCircle, X, Shield, Factory, Pill, MapPin, User, FileText, CreditCard, Hash, CalendarPlus, Syringe, Info } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useAppointmentStore } from '../store/useAppointmentStore'
import DateTimePicker from './DateTimePicker'

const AppointmentDetailModal = ({ appointment, onClose }) => {
  if (!appointment) return null

  const [isRescheduling, setIsRescheduling] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [newDate, setNewDate] = useState(appointment.scheduled_at ? new Date(appointment.scheduled_at).toISOString() : '')
  const [newNotes, setNewNotes] = useState(appointment.notes || '')
  const { deleteAppointment, editAppointment } = useAppointmentStore()
  const { authUser } = useAuthStore()

  const handleReschedule = async () => {
    if (!newDate) return
    setIsSubmitting(true)
    try {
      await editAppointment(appointment.id, newDate, newNotes)
      setIsRescheduling(false)
      onClose()
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTimeDisplay = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await deleteAppointment(appointment.id)
      setShowCancelConfirm(false)
      onClose()
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'booked':
        return { 
          text: 'Scheduled', 
          color: 'bg-blue-100 text-blue-800 border border-blue-200', 
          icon: <Clock className="h-4 w-4" />,
          description: 'Your appointment is confirmed and scheduled.'
        }
      case 'checked_in':
        return { 
          text: 'Checked In', 
          color: 'bg-amber-100 text-amber-800 border border-amber-200', 
          icon: <AlertCircle className="h-4 w-4" />,
          description: 'You have checked in. Please wait for your turn.'
        }
      case 'completed':
        return { 
          text: 'Completed', 
          color: 'bg-emerald-100 text-emerald-800 border border-emerald-200', 
          icon: <CheckCircle className="h-4 w-4" />,
          description: 'Vaccination completed successfully.'
        }
      case 'cancelled':
        return { 
          text: 'Cancelled', 
          color: 'bg-red-100 text-red-800 border border-red-200', 
          icon: <XCircle className="h-4 w-4" />,
          description: 'This appointment has been cancelled.'
        }
      case 'no_show':
        return { 
          text: 'No Show', 
          color: 'bg-gray-100 text-gray-800 border border-gray-200', 
          icon: <XCircle className="h-4 w-4" />,
          description: 'You missed this appointment.'
        }
      default:
        return { 
          text: 'Unknown', 
          color: 'bg-gray-100 text-gray-800 border border-gray-200', 
          icon: <AlertCircle className="h-4 w-4" />,
          description: 'Status unknown.'
        }
    }
  }

  const status = getStatusInfo(appointment.status)
  const vaccines = appointment.vaccines || []
  
  // Calculate total cost
  const totalCost = vaccines.reduce((sum, vaccine) => {
    return sum + (parseFloat(vaccine.price) || 0)
  }, 0)

  // Calculate total doses
  const totalDoses = vaccines.reduce((sum, vaccine) => {
    return sum + (parseInt(vaccine.doses_required) || 1)
  }, 0)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full relative max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowCancelConfirm(false)}>
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Cancel Appointment?</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700 mb-3">
                  You are about to cancel your appointment scheduled for:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <span className="font-medium">{formatDateDisplay(appointment.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Clock className="h-4 w-4 text-teal-600" />
                    <span className="font-medium">{formatTimeDisplay(appointment.scheduled_at)}</span>
                  </div>
                  {vaccines.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-900">
                      <Syringe className="h-4 w-4 text-teal-600" />
                      <span className="font-medium">{vaccines.length} vaccine{vaccines.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                If you need to change your appointment time, consider rescheduling instead of canceling.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  disabled={isCancelling}
                >
                  Keep Appointment
                </button>
                <button 
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Yes, Cancel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-teal-600 to-cyan-600">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Syringe className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-xl text-white">
                    {isRescheduling ? 'Reschedule Appointment' : 'Appointment Details'}
                  </h2>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-teal-100 text-sm flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5" />
                    {appointment.id}
                  </span>
                  {appointment.created_at && (
                    <span className="text-teal-100 text-sm flex items-center gap-1">
                      <CalendarPlus className="h-3.5 w-3.5" />
                      Booked {formatShortDate(appointment.created_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Banner */}
        {!isRescheduling && (
          <div className={`px-6 py-3 flex items-center gap-3 ${
            appointment.status === 'booked' ? 'bg-blue-50 border-b border-blue-100' :
            appointment.status === 'checked_in' ? 'bg-amber-50 border-b border-amber-100' :
            appointment.status === 'completed' ? 'bg-emerald-50 border-b border-emerald-100' :
            appointment.status === 'cancelled' ? 'bg-red-50 border-b border-red-100' :
            'bg-gray-50 border-b border-gray-100'
          }`}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${status.color}`}>
              {status.icon}
              {status.text}
            </div>
            <span className="text-sm text-gray-600">{status.description}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {isRescheduling ? (
            <div className="p-6 space-y-6">
              {/* Current Appointment Info */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <Clock className="h-4 w-4" />
                  Current Schedule
                </div>
                <p className="font-semibold text-gray-900 text-lg">
                  {formatDateDisplay(appointment.scheduled_at)}
                </p>
                <p className="text-gray-600">at {formatTimeDisplay(appointment.scheduled_at)}</p>
              </div>

              {/* Date/Time Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Select New Date & Time <span className="text-red-500">*</span>
                </label>
                <DateTimePicker 
                  value={newDate} 
                  onChange={setNewDate}
                  placeholder="Choose your preferred date and time"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Additional Notes <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Any allergies, medical conditions, or special requests..."
                  rows="3"
                  className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none placeholder-gray-400 transition-shadow"
                />
              </div>

              {/* Vaccines Summary (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Vaccines in This Appointment
                </label>
                <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                  {vaccines.map((vaccine, index) => (
                    <div key={index} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Shield className="h-4 w-4 text-teal-600" />
                        </div>
                        <div>
                          <span className="text-gray-900 font-medium">{vaccine.name}</span>
                          {vaccine.manufacturer && (
                            <span className="text-gray-500 text-sm ml-2">by {vaccine.manufacturer}</span>
                          )}
                        </div>
                      </div>
                      {vaccine.price && (
                        <span className="text-emerald-600 font-semibold">${parseFloat(vaccine.price).toFixed(2)}</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" />
                  Vaccines cannot be modified. Create a new appointment to change vaccines.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 p-4 rounded-xl border border-teal-200/50">
                  <div className="flex items-center gap-2 text-teal-700 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Date</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-sm">{formatShortDate(appointment.scheduled_at)}</p>
                </div>
                
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 p-4 rounded-xl border border-cyan-200/50">
                  <div className="flex items-center gap-2 text-cyan-700 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Time</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-sm">{formatTimeDisplay(appointment.scheduled_at)}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-xl border border-purple-200/50">
                  <div className="flex items-center gap-2 text-purple-700 mb-1">
                    <Syringe className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Vaccines</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-sm">{vaccines.length} vaccine{vaccines.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-200/50">
                  <div className="flex items-center gap-2 text-emerald-700 mb-1">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Total</span>
                  </div>
                  <p className="text-gray-900 font-semibold text-sm">${totalCost.toFixed(2)}</p>
                </div>
              </div>

              {/* Patient Information */}
              {authUser && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Full Name</p>
                      <p className="text-gray-900 font-medium">{authUser.full_name || authUser.username || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Email</p>
                      <p className="text-gray-900 font-medium">{authUser.email || 'N/A'}</p>
                    </div>
                    {authUser.phone && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                        <p className="text-gray-900 font-medium">{authUser.phone}</p>
                      </div>
                    )}
                    {authUser.date_of_birth && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Date of Birth</p>
                        <p className="text-gray-900 font-medium">{formatShortDate(authUser.date_of_birth)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Appointment Schedule */}
              <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-teal-50 rounded-xl p-5 border border-teal-200/50">
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  Scheduled Date & Time
                </h3>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900">{formatDateDisplay(appointment.scheduled_at)}</p>
                    <p className="text-lg text-teal-700 font-medium mt-1">{formatTimeDisplay(appointment.scheduled_at)}</p>
                  </div>
                  {appointment.location && (
                    <div className="flex items-start gap-2 text-gray-600 bg-white/60 px-4 py-3 rounded-lg">
                      <MapPin className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{appointment.location.name || 'Vaccination Center'}</p>
                        <p className="text-sm">{appointment.location.address || 'Address not specified'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vaccines Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  Vaccines ({vaccines.length})
                </h3>
                {vaccines.length > 0 ? (
                  <div className="space-y-3">
                    {vaccines.map((vaccine, index) => (
                      <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all">
                        <div className="flex items-start gap-4">
                          {vaccine.image_url ? (
                            <img 
                              src={vaccine.image_url} 
                              alt={vaccine.name} 
                              className="w-20 h-20 object-cover rounded-xl flex-shrink-0 bg-gray-100 border border-gray-200" 
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-teal-200">
                              <Syringe className="h-8 w-8 text-teal-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-bold text-lg text-gray-900">{vaccine.name}</h4>
                              {vaccine.price && (
                                <span className="text-emerald-600 font-bold text-lg whitespace-nowrap">
                                  ${parseFloat(vaccine.price).toFixed(2)}
                                </span>
                              )}
                            </div>
                            {vaccine.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{vaccine.description}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-3">
                              {vaccine.manufacturer && (
                                <div className="flex items-center gap-1.5 text-sm bg-gray-100 px-3 py-1.5 rounded-full">
                                  <Factory className="h-3.5 w-3.5 text-gray-500" />
                                  <span className="text-gray-700">{vaccine.manufacturer}</span>
                                </div>
                              )}
                              {vaccine.doses_required && (
                                <div className="flex items-center gap-1.5 text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                                  <Pill className="h-3.5 w-3.5 text-blue-500" />
                                  <span className="text-blue-700">{vaccine.doses_required} dose{vaccine.doses_required > 1 ? 's' : ''} required</span>
                                </div>
                              )}
                              {vaccine.efficacy_rate && (
                                <div className="flex items-center gap-1.5 text-sm bg-emerald-50 px-3 py-1.5 rounded-full">
                                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                                  <span className="text-emerald-700">{vaccine.efficacy_rate}% efficacy</span>
                                </div>
                              )}
                            </div>

                            {/* Additional vaccine info */}
                            {(vaccine.side_effects || vaccine.storage_requirements) && (
                              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                {vaccine.side_effects && (
                                  <div>
                                    <span className="text-gray-500">Side Effects:</span>
                                    <span className="text-gray-700 ml-1">{vaccine.side_effects}</span>
                                  </div>
                                )}
                                {vaccine.storage_requirements && (
                                  <div>
                                    <span className="text-gray-500">Storage:</span>
                                    <span className="text-gray-700 ml-1">{vaccine.storage_requirements}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Cost Summary */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Total Vaccines</p>
                            <p className="font-semibold text-gray-900">{vaccines.length}</p>
                          </div>
                          <div className="w-px h-8 bg-gray-300"></div>
                          <div>
                            <p className="text-sm text-gray-500">Total Doses</p>
                            <p className="font-semibold text-gray-900">{totalDoses}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Cost</p>
                          <p className="font-bold text-2xl text-emerald-600">${totalCost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No vaccines listed for this appointment</p>
                    <p className="text-gray-400 text-sm mt-1">Vaccines will appear here once assigned</p>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              {appointment.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    Notes & Special Instructions
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{appointment.notes}</p>
                  </div>
                </div>
              )}

              {/* Important Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" />
                  Important Information
                </h4>
                <ul className="text-sm text-blue-800 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    Please arrive 15 minutes before your scheduled time
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    Bring a valid ID and your health insurance card
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    Wear loose-fitting clothing for easy access to your upper arm
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    Stay hydrated and eat a light meal before your appointment
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {isRescheduling ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsRescheduling(false)}
                className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                Go Back
              </button>
              <button 
                onClick={handleReschedule}
                disabled={!newDate || isSubmitting}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Confirm Reschedule
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex-1"></div>
              {appointment.status === 'booked' && (
                <>
                  <button 
                    onClick={() => setIsRescheduling(true)}
                    className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-teal-600/20"
                  >
                    <Calendar className="h-4 w-4" />
                    Reschedule
                  </button>
                  
                  <button 
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={isCancelling}
                    className="px-5 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Cancel Appointment
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AppointmentDetailModal
