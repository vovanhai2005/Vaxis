import React, { useEffect, useState } from 'react'
import { Calendar, MapPin, Clock, ShoppingCart, Bell, Filter, Search, Loader2, CheckCircle, XCircle, AlertCircle, X, Shield, Factory, Pill } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useAppointmentStore } from '../../store/useAppointmentStore'
import { useNavigate } from 'react-router-dom';

const AppointmentDetailModal = ({ appointment, onClose }) => {
  if (!appointment) return null

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
        return { text: 'Booked', color: 'bg-blue-100 text-blue-600', icon: <Clock className="h-5 w-5" /> }
      case 'checked_in':
        return { text: 'Checked In', color: 'bg-yellow-100 text-yellow-600', icon: <AlertCircle className="h-5 w-5" /> }
      case 'completed':
        return { text: 'Completed', color: 'bg-green-100 text-green-600', icon: <CheckCircle className="h-5 w-5" /> }
      case 'cancelled':
        return { text: 'Cancelled', color: 'bg-red-100 text-red-600', icon: <XCircle className="h-5 w-5" /> }
      case 'no_show':
        return { text: 'No Show', color: 'bg-gray-100 text-gray-600', icon: <XCircle className="h-5 w-5" /> }
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-600', icon: <AlertCircle className="h-5 w-5" /> }
    }
  }

  const status = getStatusInfo(appointment.status)
  const vaccines = appointment.vaccines || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
          <X className="h-7 w-7" />
        </button>
        
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-bold text-3xl text-gray-800">Appointment #{appointment.id}</h2>
              <p className="text-gray-600 mt-2">Complete details of your vaccination appointment</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.color} font-medium`}>
              {status.icon}
              {status.text}
            </div>
          </div>

          {/* Appointment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                <h3 className="font-semibold text-gray-800">Date</h3>
              </div>
              <p className="text-gray-700 ml-8">{date}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-teal-600" />
                <h3 className="font-semibold text-gray-800">Time</h3>
              </div>
              <p className="text-gray-700 ml-8">{time}</p>
            </div>
          </div>

          {/* Vaccines Section */}
          <div className="mb-6">
            <h3 className="font-semibold text-xl text-gray-800 mb-4">Vaccines</h3>
            {vaccines.length > 0 ? (
              <div className="space-y-4">
                {vaccines.map((vaccine, index) => (
                  <div key={index} className="bg-gradient-to-r from-teal-50 to-blue-50 p-5 rounded-xl border border-teal-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800 mb-2">{vaccine.name}</h4>
                        <p className="text-gray-600 text-sm mb-3">{vaccine.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {vaccine.manufacturer && (
                            <div className="flex items-center gap-2">
                              <Factory className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700"><strong>Manufacturer:</strong> {vaccine.manufacturer}</span>
                            </div>
                          )}
                          {vaccine.doses_required && (
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700"><strong>Doses:</strong> {vaccine.doses_required}</span>
                            </div>
                          )}
                          {vaccine.efficacy_rate && (
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700"><strong>Efficacy:</strong> {vaccine.efficacy_rate}%</span>
                            </div>
                          )}
                          {vaccine.price && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700"><strong>Price:</strong> ${parseFloat(vaccine.price).toFixed(2)}</span>
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
              <h3 className="font-semibold text-xl text-gray-800 mb-3">Notes</h3>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-gray-700">{appointment.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {appointment.status === 'booked' && (
              <>
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition">
                  Reschedule Appointment
                </button>
                <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition">
                  Cancel Appointment
                </button>
              </>
            )}
            <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium transition">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const AppointmentPage = () => {
  const { authUser } = useAuthStore()
  const { appointments, isLoadingAppointments, getCitizenAppointments, deleteAppointment } = useAppointmentStore()
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
          color: 'bg-blue-100 text-blue-600',
          icon: <Clock className="h-5 w-5" />
        }
      case 'checked_in':
        return { 
          text: 'Checked In', 
          color: 'bg-yellow-100 text-yellow-600',
          icon: <AlertCircle className="h-5 w-5" />
        }
      case 'completed':
        return { 
          text: 'Completed', 
          color: 'bg-green-100 text-green-600',
          icon: <CheckCircle className="h-5 w-5" />
        }
      case 'cancelled':
        return { 
          text: 'Cancelled', 
          color: 'bg-red-100 text-red-600',
          icon: <XCircle className="h-5 w-5" />
        }
      case 'no_show':
        return { 
          text: 'No Show', 
          color: 'bg-gray-100 text-gray-600',
          icon: <XCircle className="h-5 w-5" />
        }
      default:
        return { 
          text: 'Unknown', 
          color: 'bg-gray-100 text-gray-600',
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
          <p className="text-gray-500">View and manage your vaccination appointments</p>
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
                <div key={appointment.id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl text-gray-800 mb-2">
                        Appointment #{appointment.id}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{time}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.color} font-medium`}>
                      {status.icon}
                      {status.text}
                    </div>
                  </div>

                  {/* Vaccines */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Vaccines:</h4>
                    <div className="space-y-2">
                      {vaccines.length > 0 ? (
                        vaccines.map((vaccine, index) => (
                          <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            <span className="text-gray-800">{vaccine.name}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No vaccines listed</p>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {appointment.notes && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Notes:</h4>
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                        {appointment.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded-lg font-medium transition">
                      View Details
                    </button>
                    {appointment.status === 'booked' && (
                      <>
                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 px-4 rounded-lg font-medium transition">
                          Reschedule
                        </button>
                        <button className="bg-red-100 hover:bg-red-200 text-red-600 py-2 px-4 rounded-lg font-medium transition">
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
                className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition">
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