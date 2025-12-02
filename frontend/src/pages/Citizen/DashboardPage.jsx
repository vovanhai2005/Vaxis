import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUserStore } from '../../store/useUserStore'
import { useAppointmentStore } from '../../store/useAppointmentStore'
import { useVaccineStore } from '../../store/useVaccineStore'
import { CheckCircle, Clock, Newspaper, Calendar, MapPin, Loader2, LayoutDashboard } from 'lucide-react'
import Header from '../../components/Header'
import { useNavigate } from 'react-router-dom'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { authUser } = useAuthStore()
  const { vaccineHistory, notifications, getVaccineHistory, getNotifications, isLoadingHistory, isLoadingNotifications } = useUserStore()
  const { appointments, isLoadingAppointments, getCitizenAppointments } = useAppointmentStore()
  const { selectedVaccines } = useVaccineStore()
  
  const [stats, setStats] = useState({
    completedVaccines: 0,
    upcomingAppointments: 0
  })

  useEffect(() => {
    getVaccineHistory()
    getNotifications()
    getCitizenAppointments()
  }, [getVaccineHistory, getNotifications, getCitizenAppointments])

  useEffect(() => {
    if (vaccineHistory) {
      setStats(prev => ({
        ...prev,
        completedVaccines: vaccineHistory.length
      }))
    }
    if (appointments) {
      setStats(prev => ({
        ...prev,
        upcomingAppointments: appointments.length
      }))
    }
  }, [vaccineHistory, appointments])

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now - date
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInDays === 1) return '1 day ago'
    return `${diffInDays} days ago`
  }

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
        return { text: 'Booked', color: 'bg-blue-500' }
      case 'checked_in':
        return { text: 'Checked In', color: 'bg-yellow-500' }
      case 'completed':
        return { text: 'Completed', color: 'bg-green-500' }
      case 'cancelled':
        return { text: 'Cancelled', color: 'bg-red-500' }
      case 'no_show':
        return { text: 'No Show', color: 'bg-gray-500' }
      default:
        return { text: 'Unknown', color: 'bg-gray-400' }
    }
  }

  const newsItems = [
    {
      id: 1,
      category: 'COVID-19',
      categoryColor: 'bg-blue-100 text-blue-600',
      time: '2 hours ago',
      title: 'New COVID-19 Booster Shots Now Available',
      description: 'Updated vaccines targeting latest variants are now available for booking. Priority given to high-risk groups.'
    },
    {
      id: 2,
      category: 'Influenza',
      categoryColor: 'bg-purple-100 text-purple-600',
      time: '5 hours ago',
      title: 'Flu Season Vaccination Drive Starts Next Week',
      description: 'Annual influenza vaccination campaign begins Monday. Walk-ins welcome at all participating clinics.'
    },
    {
      id: 3,
      category: 'HPV',
      categoryColor: 'bg-pink-100 text-pink-600',
      time: '1 day ago',
      title: 'HPV Vaccination Recommended for Teens',
      description: 'Health ministry updates guidelines recommending HPV vaccination for adolescents aged 11-12 years.'
    },
    {
      id: 4,
      category: 'General',
      categoryColor: 'bg-gray-100 text-gray-600',
      time: '2 days ago',
      title: 'Record Vaccination Numbers This Month',
      description: 'Over 50,000 vaccines administered this month, marking a 20% increase from last month.'
    },
    {
      id: 5,
      category: 'Hepatitis B',
      categoryColor: 'bg-yellow-100 text-yellow-600',
      time: '3 days ago',
      title: 'Free Hepatitis B Screening Available',
      description: 'Get tested for Hepatitis B at no cost during National Liver Health Month. Vaccination available for those at risk.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30">
      <Header 
        title="Dashboard" 
        subtitle={`Welcome back, ${authUser?.full_name || authUser?.username || 'User'}`}
        icon={LayoutDashboard}
        notificationCount={notifications.length}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - News */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Newspaper className="h-6 w-6 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-800">
                {notifications.length > 0 ? 'Recent Notifications' : 'Daily Vaccination News'}
              </h2>
            </div>

            {isLoadingNotifications ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-6">
                {notifications.length > 0 ? (
                  notifications.slice(0, 4).map((notification) => (
                    <div key={notification.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          notification.type === 'reminder' ? 'bg-blue-100 text-blue-600' :
                          notification.type === 'news' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">{notification.subject}</h3>
                      <p className="text-sm text-gray-500">{notification.body}</p>
                    </div>
                  ))
                ) : (
                  newsItems.map((news) => (
                    <div key={news.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${news.categoryColor}`}>
                          {news.category}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {news.time}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">{news.title}</h3>
                      <p className="text-sm text-gray-500">{news.description}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Appointments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completed Vaccines */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 mb-2">Completed</p>
                  {isLoadingHistory ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-1" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-800 mb-1">{stats.completedVaccines} Vaccines</p>
                  )}
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 mb-2">Upcoming</p>
                  {isLoadingAppointments ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-1" />
                  ) : (
                    <p className="text-3xl font-bold text-gray-800 mb-1">{stats.upcomingAppointments} Appointments</p>
                  )}
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-6 w-6 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
            </div>

            {isLoadingAppointments ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.length > 0 ? (
                  appointments.slice(0, 3).map((appointment) => {
                    const { date, time } = formatDate(appointment.scheduled_at)
                    const status = getStatusInfo(appointment.status)
                    const vaccines = appointment.vaccines.map(v => v.name).join(', ')

                    return (
                      <div key={appointment.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                              {vaccines || 'General Check-up'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {date} • {time}
                            </p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full text-white ${status.color}`}>
                            {status.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <MapPin className="h-4 w-4" />
                          <span>{appointment.notes || 'Community Health Center'}</span>
                        </div>

                        <div className="flex gap-3">
                          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition">
                            View Details
                          </button>
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition">
                            Reschedule
                          </button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No upcoming appointments found.</p>
                    <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg transition">
                      Book an Appointment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
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

export default DashboardPage