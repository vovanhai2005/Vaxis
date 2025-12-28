import React, { useEffect, useState } from 'react'
import { Calendar, Clock, Filter, Search, Loader2, CheckCircle, XCircle, AlertCircle, Shield, Syringe, CalendarPlus, FileText } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useAppointmentStore } from '../../store/useAppointmentStore'
import { useVaccineStore } from '../../store/useVaccineStore'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import AppointmentDetailModal from '../../components/AppointmentDetailModal'

const AppointmentPage = () => {
  const navigate = useNavigate()
  const { authUser } = useAuthStore()
  const { appointments, isLoadingAppointments, getCitizenAppointments, deleteAppointment } = useAppointmentStore()
  const { selectedVaccines } = useVaccineStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    getCitizenAppointments()
  }, [getCitizenAppointments])

  const formatDate = (dateString) => {
    if (!dateString) return { date: 'N/A', time: 'N/A', weekday: '' }
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      fullDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }
  }

  const getStatusInfo = (status, scheduledAt) => {
    const now = new Date()
    const appointmentDate = new Date(scheduledAt)
    const isExpired = status === 'booked' && appointmentDate < now

    if (isExpired) {
      return {
        text: 'Expired',
        color: 'bg-red-100 text-red-800 border border-red-200',
        cardBorder: 'border-l-red-500',
        icon: <XCircle className="h-4 w-4" />,
        opacity: 'opacity-60'
      }
    }

    switch (status) {
      case 'booked':
        return { 
          text: 'Scheduled', 
          color: 'bg-blue-100 text-blue-800 border border-blue-200',
          cardBorder: 'border-l-blue-500',
          icon: <Clock className="h-4 w-4" />,
          opacity: ''
        }
      case 'checked_in':
        return { 
          text: 'Checked In', 
          color: 'bg-amber-100 text-amber-800 border border-amber-200',
          cardBorder: 'border-l-amber-500',
          icon: <AlertCircle className="h-4 w-4" />,
          opacity: ''
        }
      case 'administered':
        return { 
          text: 'Administered', 
          color: 'bg-purple-100 text-purple-800 border border-purple-200',
          cardBorder: 'border-l-purple-500',
          icon: <Syringe className="h-4 w-4" />,
          opacity: ''
        }
      case 'completed':
        return { 
          text: 'Completed', 
          color: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
          cardBorder: 'border-l-emerald-500',
          icon: <CheckCircle className="h-4 w-4" />,
          opacity: ''
        }
      case 'cancelled':
        return { 
          text: 'Cancelled', 
          color: 'bg-red-100 text-red-800 border border-red-200',
          cardBorder: 'border-l-red-500',
          icon: <XCircle className="h-4 w-4" />,
          opacity: 'opacity-60'
        }
      case 'no_show':
        return { 
          text: 'No Show', 
          color: 'bg-gray-100 text-gray-800 border border-gray-200',
          cardBorder: 'border-l-gray-500',
          icon: <XCircle className="h-4 w-4" />,
          opacity: 'opacity-60'
        }
      default:
        return { 
          text: 'Unknown', 
          color: 'bg-gray-100 text-gray-800 border border-gray-200',
          cardBorder: 'border-l-gray-500',
          icon: <AlertCircle className="h-4 w-4" />,
          opacity: ''
        }
    }
  }

  const filteredAppointments = appointments
    .filter(appointment => appointment.status !== 'completed') // Exclude completed appointments
    .filter(appointment => {
      const matchesSearch = (appointment.vaccines && appointment.vaccines.some(v => 
        v?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )) || (appointment.notes && appointment.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const now = new Date()
      const isExpired = appointment.status === 'booked' && new Date(appointment.scheduled_at) < now
      const isActiveBooked = appointment.status === 'booked' && new Date(appointment.scheduled_at) >= now
      
      let matchesFilter = false
      if (filterStatus === 'all') {
        matchesFilter = true
      } else if (filterStatus === 'expired') {
        matchesFilter = isExpired
      } else if (filterStatus === 'booked') {
        matchesFilter = isActiveBooked
      } else {
        matchesFilter = appointment.status === filterStatus
      }
      
      return matchesSearch && matchesFilter
    })

  // Sort appointments: upcoming first, then by date
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.scheduled_at)
    const dateB = new Date(b.scheduled_at)
    // Prioritize booked/checked_in appointments
    if (a.status === 'booked' && b.status !== 'booked') return -1
    if (b.status === 'booked' && a.status !== 'booked') return 1
    return dateB - dateA
  })

  const now = new Date()
  const activeAppointments = appointments.filter(a => 
    a.status !== 'completed' && a.status !== 'cancelled'
  )
  const expiredAppointments = activeAppointments.filter(a => 
    a.status === 'booked' && new Date(a.scheduled_at) < now
  )
  const activeBookedAppointments = activeAppointments.filter(a => 
    a.status === 'booked' && new Date(a.scheduled_at) >= now
  )

  const statusCounts = {
    all: activeAppointments.length,
    booked: activeBookedAppointments.length,
    expired: expiredAppointments.length,
    checked_in: activeAppointments.filter(a => a.status === 'checked_in').length,
    administered: activeAppointments.filter(a => a.status === 'administered').length,
    completed: 0,
    cancelled: 0,
  }

  // Calculate stats
  const upcomingCount = activeAppointments.filter(a => a.status === 'booked' || a.status === 'checked_in' || a.status === 'administered').length
  const totalAppointmentsEver = appointments.length
  const completedCount = appointments.filter(a => a.status === 'completed').length
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30">
      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setCancellingId(null)}>
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
            
            <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              Are you sure you want to cancel appointment <span className="font-semibold">#{cancellingId}</span>? 
              You will need to create a new appointment if you change your mind.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setCancellingId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Keep Appointment
              </button>
              <button 
                onClick={async () => {
                  await deleteAppointment(cancellingId)
                  setCancellingId(null)
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <AppointmentDetailModal 
          appointment={selectedAppointment} 
          onClose={() => setSelectedAppointment(null)} 
        />
      )}

      {/* Header */}
      <Header
        title="My Appointments"
        subtitle="Manage your vaccination schedule"
        icon={Syringe}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeAppointments.length}</p>
            <p className="text-sm text-gray-500 mt-1">Active Appointments</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-teal-600" />
              </div>
              <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{upcomingCount}</p>
            <p className="text-sm text-gray-500 mt-1">Upcoming</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Done</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
            <p className="text-sm text-gray-500 mt-1">Completed</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Syringe className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalAppointmentsEver}</p>
            <p className="text-sm text-gray-500 mt-1">Total Appointments</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by vaccine name or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white border border-gray-200 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All', count: statusCounts.all },
                  { value: 'booked', label: 'Scheduled', count: statusCounts.booked },
                  { value: 'expired', label: 'Expired', count: statusCounts.expired },
                  { value: 'checked_in', label: 'Checked In', count: statusCounts.checked_in },
                  { value: 'administered', label: 'Administered', count: statusCounts.administered },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === filter.value
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                    <span className={`ml-1.5 ${filterStatus === filter.value ? 'text-teal-100' : 'text-gray-400'}`}>
                      ({filter.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!isLoadingAppointments && filteredAppointments.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filteredAppointments.length}</span> appointment{filteredAppointments.length !== 1 ? 's' : ''}
              {filterStatus !== 'all' && <span> • Filtered by: <span className="font-medium text-teal-600">{filterStatus.replace('_', ' ')}</span></span>}
            </p>
            <button
              onClick={() => navigate('/booking')}
              className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1.5 hover:underline"
            >
              <CalendarPlus className="h-4 w-4" />
              New Appointment
            </button>
          </div>
        )}

        {/* Appointments List */}
        {isLoadingAppointments ? (
          <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl border border-gray-200">
            <Loader2 className="h-12 w-12 animate-spin text-teal-500 mb-4" />
            <p className="text-gray-500 font-medium">Loading your appointments...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {sortedAppointments.length > 0 ? (
              sortedAppointments.map((appointment) => {
                const { date, time, weekday, fullDate } = formatDate(appointment.scheduled_at)
                const status = getStatusInfo(appointment.status, appointment.scheduled_at)
                const vaccines = appointment.vaccines || []
                const totalCost = vaccines.reduce((sum, v) => sum + (parseFloat(v.price) || 0), 0)

                return (
                  <div 
                    key={appointment.id} 
                    className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 border-l-4 ${status.cardBorder} overflow-hidden group ${status.opacity}`}
                  >
                    {/* Card Header */}
                    <div className="p-5 pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl flex flex-col items-center justify-center border border-teal-100">
                            <span className="text-xs font-medium text-teal-600 uppercase">
                              {new Date(appointment.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                              {new Date(appointment.scheduled_at).getDate()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg text-gray-900">
                                #{appointment.id}
                              </h3>
                              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                {status.icon}
                                {status.text}
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm">{weekday}</p>
                            <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{time}</span>
                            </div>
                          </div>
                        </div>
                        {totalCost > 0 && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium mb-1">Total Cost</p>
                            <p className="text-3xl font-bold text-emerald-600">${totalCost.toFixed(2)}</p>
                          </div>
                        )}
                      </div>

                      {/* Vaccines Preview */}
                      {vaccines.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {vaccines.slice(0, 3).map((vaccine, index) => (
                              <div 
                                key={index} 
                                className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                              >
                                <Syringe className="h-3.5 w-3.5 text-teal-600" />
                                <span className="text-sm text-gray-700 font-medium">{vaccine.name}</span>
                              </div>
                            ))}
                            {vaccines.length > 3 && (
                              <div className="flex items-center gap-1 bg-teal-50 px-3 py-2 rounded-lg border border-teal-100">
                                <span className="text-sm text-teal-700 font-medium">+{vaccines.length - 3} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quick Info */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span>{vaccines.length} vaccine{vaccines.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                      <button 
                        onClick={() => setSelectedAppointment(appointment)}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md group-hover:shadow-teal-600/20"
                      >
                        <FileText className="h-4 w-4" />
                        View Details
                      </button>
                      {appointment.status === 'booked' && (
                        <button 
                          onClick={() => setCancellingId(appointment.id)}
                          className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-2 text-center py-20 bg-white rounded-2xl border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No appointments found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                    : 'You haven\'t scheduled any vaccination appointments yet. Book your first appointment to get started.'}
                </p>
                <button 
                  onClick={() => navigate('/booking')}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-8 rounded-xl transition-colors inline-flex items-center gap-2 shadow-lg shadow-teal-600/20"
                >
                  <CalendarPlus className="h-5 w-5" />
                  Book an Appointment
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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

export default AppointmentPage