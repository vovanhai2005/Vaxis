import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUserStore } from '../../store/useUserStore'
import { ShoppingCart, Bell, CheckCircle, Clock, Newspaper, Calendar, MapPin, Loader2 } from 'lucide-react'

const DashboardPage = () => {
  const { authUser } = useAuthStore()
  const { vaccineHistory, notifications, getVaccineHistory, getNotifications, isLoadingHistory, isLoadingNotifications } = useUserStore()
  
  const [stats, setStats] = useState({
    completedVaccines: 0,
    upcomingAppointments: 2
  })

  useEffect(() => {
    getVaccineHistory()
    getNotifications()
  }, [getVaccineHistory, getNotifications])

  useEffect(() => {
    if (vaccineHistory) {
      setStats(prev => ({
        ...prev,
        completedVaccines: vaccineHistory.length
      }))
    }
  }, [vaccineHistory])

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
    }
  ]

  const appointments = [
    {
      id: 1,
      title: 'Annual Health Check-up',
      date: 'October 20, 2025',
      time: '10:30 AM',
      location: 'Community Health Center, District 1',
      status: 'Confirmed',
      statusColor: 'bg-green-500'
    },
    {
      id: 2,
      title: 'COVID-19 Booster',
      subtitle: '(Due)',
      date: 'November 15, 2025',
      time: 'Not scheduled',
      location: 'To be determined',
      status: 'Action Needed',
      statusColor: 'bg-orange-500',
      needsScheduling: true
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {authUser?.full_name || authUser?.username || 'User'}</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ShoppingCart className="h-6 w-6 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
            <Bell className="h-6 w-6 text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{authUser?.full_name || authUser?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{authUser?.role || 'Patient'}</p>
            </div>
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(authUser?.fullName || authUser?.username || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

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
                  <p className="text-3xl font-bold text-gray-800 mb-1">{stats.upcomingAppointments} Appointments</p>
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

            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        {appointment.title}
                        {appointment.subtitle && (
                          <span className="text-red-500 text-sm">{appointment.subtitle}</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {appointment.date} • {appointment.time}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full text-white ${appointment.statusColor}`}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{appointment.location}</span>
                  </div>

                  <div className="flex gap-3">
                    {appointment.needsScheduling ? (
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition">
                        Schedule Appointment
                      </button>
                    ) : (
                      <>
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition">
                          View Details
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition">
                          Reschedule
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Button */}
      <button className="fixed bottom-8 right-8 bg-gray-800 hover:bg-gray-900 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition">
        <span className="text-xl">?</span>
      </button>
    </div>
  )
}

export default DashboardPage