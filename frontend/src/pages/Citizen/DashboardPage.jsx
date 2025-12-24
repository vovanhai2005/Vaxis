import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUserStore } from '../../store/useUserStore'
import { useAppointmentStore } from '../../store/useAppointmentStore'
import { useVaccineStore } from '../../store/useVaccineStore'
import { CheckCircle, Clock, Newspaper, Calendar, MapPin, Loader2, LayoutDashboard, Syringe, CalendarPlus, FileText, User, ChevronRight, Lightbulb } from 'lucide-react'
import Header from '../../components/Header'
import { useNavigate } from 'react-router-dom'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { authUser } = useAuthStore()
  const { vaccineHistory, getVaccineHistory, isLoadingHistory } = useUserStore()
  const { appointments, isLoadingAppointments, getCitizenAppointments } = useAppointmentStore()
  const { selectedVaccines } = useVaccineStore()
  
  const [stats, setStats] = useState({
    completedVaccines: 0,
    upcomingAppointments: 0
  })

  useEffect(() => {
    getVaccineHistory()
    getCitizenAppointments()
  }, [getVaccineHistory, getCitizenAppointments])

  useEffect(() => {
    if (vaccineHistory) {
      setStats(prev => ({
        ...prev,
        completedVaccines: vaccineHistory.length
      }))
    }
    if (appointments) {
      // Only count appointments that are upcoming (booked or checked_in) and in the future
      const upcomingCount = appointments.filter(apt => 
        (apt.status === 'booked' || apt.status === 'checked_in') && 
        new Date(apt.scheduled_at) >= new Date()
      ).length
      setStats(prev => ({
        ...prev,
        upcomingAppointments: upcomingCount
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
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

        {/* Main Grid - News, Quick Actions, Vaccination History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - News */}
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Newspaper className="h-6 w-6 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-800">Daily Vaccination News</h2>
            </div>

            <div className="space-y-2 flex-1 overflow-hidden">
              {newsItems.slice(0, 5).map((news) => (
                <div key={news.id} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${news.categoryColor}`}>
                      {news.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {news.time}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{news.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{news.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Column - Quick Actions & Vaccination History */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Quick Actions & Vaccination History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <CalendarPlus className="h-6 w-6 text-teal-600" />
                <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/vaccination-info')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Syringe className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Vaccination Info</p>
                      <p className="text-sm text-gray-500">Learn about vaccines</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition" />
                </button>

                <button 
                  onClick={() => navigate('/booking')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 rounded-xl border border-teal-200/50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <CalendarPlus className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">Book Appointment</p>
                      <p className="text-sm text-gray-500">Schedule your vaccination</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-teal-600 transition" />
                </button>

                <button 
                  onClick={() => navigate('/appointment')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">My Appointments</p>
                      <p className="text-sm text-gray-500">View & manage bookings</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
                </button>

                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">My Profile</p>
                      <p className="text-sm text-gray-500">Update personal info</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition" />
                </button>
              </div>

              <div className="mt-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-3 border border-teal-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-white rounded-lg shadow-sm text-teal-600">
                    <Lightbulb className="h-3 w-3" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-xs">Health Tips</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="w-0.5 bg-teal-200 rounded-full flex-shrink-0 mt-1"></div>
                    <p className="text-xs text-gray-600 leading-tight">
                      <span className="font-medium text-teal-700">Stay Hydrated:</span> Drink water before & after vaccination.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="w-0.5 bg-teal-200 rounded-full flex-shrink-0 mt-1"></div>
                    <p className="text-xs text-gray-600 leading-tight">
                      <span className="font-medium text-teal-700">Keep Moving:</span> Move your arm to reduce soreness.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-0.5 bg-teal-200 rounded-full flex-shrink-0 mt-1"></div>
                    <p className="text-xs text-gray-600 leading-tight">
                      <span className="font-medium text-teal-700">Rest Well:</span> Sleep helps your immune response.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Vaccination History */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Syringe className="h-6 w-6 text-emerald-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Vaccination History</h2>
                </div>
              </div>

              {isLoadingHistory ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : vaccineHistory && vaccineHistory.length > 0 ? (
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {vaccineHistory.slice(0, 6).map((record, index) => {
                    const administeredDate = new Date(record.administered_at)
                    return (
                      <div key={record.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{record.vaccine_name || 'Vaccine'}</p>
                          <p className="text-sm text-gray-500">
                            {administeredDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {record.dose_number && ` • Dose ${record.dose_number}`}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {vaccineHistory.length > 6 && (
                    <p className="text-center text-sm text-gray-500 pt-2">
                      +{vaccineHistory.length - 6} more records
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
                  <Syringe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No vaccination records yet</p>
                  <p className="text-sm text-gray-400 mt-1">Your history will appear here after vaccination</p>
                </div>
              )}

              {vaccineHistory && vaccineHistory.length > 0 && (
                <button
                  onClick={() => navigate('/profile')}
                  className="mt-4 w-full px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg border border-emerald-200 transition flex items-center justify-center gap-2"
                >
                  View Full History
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
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