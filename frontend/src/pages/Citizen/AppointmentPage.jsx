import React, { useEffect, useState } from 'react'
import { Calendar, Bell, Clock, Filter, Search, Loader2, CheckCircle, XCircle, AlertCircle, X, Shield, Factory, Pill, ShoppingCart } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useAppointmentStore } from '../../store/useAppointmentStore'
import { useVaccineStore } from '../../store/useVaccineStore'
import { useNavigate } from 'react-router-dom'
import DateTimePicker from '../../components/DateTimePicker'
import Header from '../../components/Header'

const AppointmentDetailModal = ({ appointment, onClose }) => {
  if (!appointment) return null

  const [isRescheduling, setIsRescheduling] = useState(false)
  // Ensure the date is in ISO format for the DateTimePicker
  const [newDate, setNewDate] = useState(appointment.scheduled_at ? new Date(appointment.scheduled_at).toISOString() : '')
  const [newNotes, setNewNotes] = useState(appointment.notes || '')
  const { deleteAppointment, editAppointment } = useAppointmentStore()

  const handleReschedule = async () => {
    if (!newDate) {
      return
    }
    try {
      await editAppointment(appointment.id, newDate, newNotes)
      setIsRescheduling(false)
      onClose()
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
    }
  }

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatTimeDisplay = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await deleteAppointment(appointment.id)
        onClose()
      } catch (error) {
        console.error('Error cancelling appointment:', error)
      }
    }
  }

  const { date, time } = (() => {
    if (!appointment.scheduled_at) return { date: 'N/A', time: 'N/A' }
    const d = new Date(appointment.scheduled_at)
    return {
      date: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  })()

  const getStatusInfo = (status) => {
    switch (status) {
      case 'booked':
        return { text: 'Booked', color: 'bg-blue-600 text-white', icon: <Clock className="h-5 w-5" /> }
      case 'checked_in':
        return { text: 'Checked In', color: 'bg-amber-600 text-white', icon: <AlertCircle className="h-5 w-5" /> }
      case 'completed':
        return { text: 'Completed', color: 'bg-green-600 text-white', icon: <CheckCircle className="h-5 w-5" /> }
      case 'cancelled':
        return { text: 'Cancelled', color: 'bg-red-600 text-white', icon: <XCircle className="h-5 w-5" /> }
      case 'no_show':
        return { text: 'No Show', color: 'bg-gray-700 text-white', icon: <XCircle className="h-5 w-5" /> }
      default:
        return { text: 'Unknown', color: 'bg-gray-700 text-white', icon: <AlertCircle className="h-5 w-5" /> }
    }
  }

  const status = getStatusInfo(appointment.status)
  const vaccines = appointment.vaccines || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Modal Header: Status button next to X */}
        <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.color} font-medium`}>
            {status.icon}
            {status.text}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="p-8">
          {isRescheduling ? (
            // Reschedule Form
            <div>
              <h2 className="font-bold text-3xl text-gray-900 mb-6">Reschedule Appointment</h2>
              
              {/* Date/Time Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Select new date & time</label>
                <DateTimePicker 
                  value={newDate} 
                  onChange={setNewDate}
                  placeholder="Select appointment date and time"
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Notes (Optional)</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Add any special notes for your appointment..."
                  rows="4"
                  className="w-full p-3 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none placeholder-gray-500 font-medium"
                />
              </div>

              {/* Vaccines Display (Read-only) */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Vaccines (Cannot be changed)</h3>
                <div className="space-y-2">
                  {vaccines.map((vaccine, index) => (
                    <div key={index} className="flex items-center gap-3 bg-teal-50 p-3 rounded-lg border border-teal-200">
                      <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                      <span className="text-gray-900 font-medium">{vaccine.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-300">
                <button 
                  onClick={handleReschedule}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-semibold transition shadow-sm"
                >
                  Confirm Reschedule
                </button>
                <button 
                  onClick={() => setIsRescheduling(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold transition shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <>
              {/* Header */}
              <div className="mb-6">
                <h2 className="font-bold text-3xl text-gray-900">Appointment #{appointment.id}</h2>
                <p className="text-gray-700 mt-2 font-medium">Complete details of your vaccination appointment</p>
              </div>

              {/* Appointment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-teal-700" />
                    <h3 className="font-semibold text-gray-900">Date</h3>
                  </div>
                  <p className="text-gray-900 ml-8 font-medium">{formatDateDisplay(appointment.scheduled_at)}</p>
                </div>
                
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-teal-700" />
                    <h3 className="font-semibold text-gray-900">Time</h3>
                  </div>
                  <p className="text-gray-900 ml-8 font-medium">{formatTimeDisplay(appointment.scheduled_at)}</p>
                </div>
              </div>

              {/* Vaccines Section */}
              <div className="mb-6">
                <h3 className="font-semibold text-xl text-gray-900 mb-4">Vaccines</h3>
                {vaccines.length > 0 ? (
                  <div className="space-y-4">
                    {vaccines.map((vaccine, index) => (
                      <div key={index} className="bg-gradient-to-r from-teal-50 to-cyan-50 p-5 rounded-xl border border-teal-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-2">{vaccine.name}</h4>
                            <p className="text-gray-700 text-sm mb-3 font-medium">{vaccine.description}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {vaccine.manufacturer && (
                                <div className="flex items-center gap-2">
                                  <Factory className="h-4 w-4 text-teal-700" />
                                  <span className="text-sm text-gray-900 font-medium"><strong>Manufacturer:</strong> {vaccine.manufacturer}</span>
                                </div>
                              )}
                              {vaccine.doses_required && (
                                <div className="flex items-center gap-2">
                                  <Pill className="h-4 w-4 text-teal-700" />
                                  <span className="text-sm text-gray-900 font-medium"><strong>Doses:</strong> {vaccine.doses_required}</span>
                                </div>
                              )}
                              {vaccine.efficacy_rate && (
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-teal-700" />
                                  <span className="text-sm text-gray-900 font-medium"><strong>Efficacy:</strong> {vaccine.efficacy_rate}%</span>
                                </div>
                              )}
                              {vaccine.price && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-900 font-medium"><strong>Price:</strong> ${parseFloat(vaccine.price).toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {vaccine.image_url && (
                            <img src={vaccine.image_url} alt={vaccine.name} className="w-24 h-24 object-cover rounded-lg ml-4" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">No vaccines listed</p>
                )}
              </div>

              {/* Notes Section */}
              {appointment.notes && (
                <div className="mb-6">
                  <h3 className="font-semibold text-xl text-gray-900 mb-3">Notes</h3>
                  <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg">
                    <p className="text-gray-900 font-medium">{appointment.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-300">
                {appointment.status === 'booked' && (
                  <>
                    <button 
                      onClick={() => setIsRescheduling(true)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition shadow-sm"
                    >
                      Reschedule Appointment
                    </button>
                    <button 
                      onClick={onClose}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition shadow-sm"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const AppointmentPage = () => {
  const navigate = useNavigate()
  const { authUser } = useAuthStore()
  const { appointments, isLoadingAppointments, getCitizenAppointments, deleteAppointment } = useAppointmentStore()
  const { selectedVaccines } = useVaccineStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  useEffect(() => {
    getCitizenAppointments()
  }, [getCitizenAppointments])

  const formatDate = (dateString) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' }
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'booked':
        return { 
          text: 'Booked', 
          color: 'bg-blue-600 text-white',
          icon: <Clock className="h-5 w-5" />
        }
      case 'checked_in':
        return { 
          text: 'Checked In', 
          color: 'bg-amber-600 text-white',
          icon: <AlertCircle className="h-5 w-5" />
        }
      case 'completed':
        return { 
          text: 'Completed', 
          color: 'bg-green-600 text-white',
          icon: <CheckCircle className="h-5 w-5" />
        }
      case 'cancelled':
        return { 
          text: 'Cancelled', 
          color: 'bg-red-600 text-white',
          icon: <XCircle className="h-5 w-5" />
        }
      case 'no_show':
        return { 
          text: 'No Show', 
          color: 'bg-gray-700 text-white',
          icon: <XCircle className="h-5 w-5" />
        }
      default:
        return { 
          text: 'Unknown', 
          color: 'bg-gray-700 text-white',
          icon: <AlertCircle className="h-5 w-5" />
        }
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = (appointment.vaccines && appointment.vaccines.some(v => 
      v?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )) || (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const statusCounts = {
    all: appointments.length,
    booked: appointments.filter(a => a.status === 'booked').length,
    checked_in: appointments.filter(a => a.status === 'checked_in').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal 
          appointment={selectedAppointment} 
          onClose={() => setSelectedAppointment(null)} 
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
          <p className="text-gray-500">View and manage your vaccination appointments</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition relative"
            onClick={() => navigate('/booking')}
          >
            <ShoppingCart className="h-6 w-6 text-gray-600" />
            {selectedVaccines.length > 0 && (
              <span className="absolute top-0 right-0 bg-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {selectedVaccines.length}
              </span>
            )}
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
              <p className="text-xs text-gray-500 capitalize">{authUser?.role || 'People'}</p>
            </div>
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(authUser?.full_name || authUser?.username || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments by vaccine name or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-12 pr-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 border border-gray-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white px-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 border border-gray-200"
          >
            <option value="all">All ({statusCounts.all})</option>
            <option value="booked">Booked ({statusCounts.booked})</option>
            <option value="checked_in">Checked In ({statusCounts.checked_in})</option>
            <option value="completed">Completed ({statusCounts.completed})</option>
            <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {isLoadingAppointments ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => {
              const { date, time } = formatDate(appointment.scheduled_at)
              const status = getStatusInfo(appointment.status)
              const vaccines = appointment.vaccines || []

              return (
                <div key={appointment.id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl text-gray-900 mb-2">
                        Appointment #{appointment.id}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-medium">{date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-medium">{time}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${status.color} font-semibold text-sm`}>
                      {status.icon}
                      {status.text}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-300">
                    <button 
                      onClick={() => setSelectedAppointment(appointment)}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-semibold transition shadow-sm"
                    >
                      View Details
                    </button>
                    {appointment.status === 'booked' && (
                      <>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this appointment?')) {
                              deleteAppointment(appointment.id)
                            }
                          }}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-semibold transition shadow-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-2 text-center py-24">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No appointments found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You haven\'t booked any appointments yet'}
              </p>
              <button 
                onClick={() => navigate('/booking')}
                className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition"
              >
                Book an Appointment
              </button>
            </div>
          )}
        </div>
      )}

      {/* Help Button */}
      <button className="fixed bottom-8 right-8 bg-gray-800 hover:bg-gray-900 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition">
        <span className="text-xl">?</span>
      </button>
    </div>
  )
}

export default AppointmentPage