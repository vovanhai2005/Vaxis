import React, { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUserStore } from '../../store/useUserStore'
import { useAppointmentStore } from '../../store/useAppointmentStore'
import { CheckCircle, Clock, Newspaper, Calendar, Loader2, LayoutDashboard, Syringe, CalendarPlus, ChevronRight, ExternalLink, AlertCircle } from 'lucide-react'
import Header from '../../components/Header'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../lib/axios'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { authUser } = useAuthStore()
  const { appointmentHistory, getAppointmentHistory, isLoadingHistory } = useUserStore()
  const { appointments, isLoadingAppointments, getCitizenAppointments } = useAppointmentStore()
  
  // FIX 1: Chuyển stats từ useState/useEffect sang useMemo để tránh re-render loop
  const stats = useMemo(() => {
    const completed = appointmentHistory?.reduce((sum, apt) => {
      return sum + (apt.vaccines?.length || 0)
    }, 0) || 0;

    const upcoming = appointments?.filter(apt => 
      (apt.status === 'booked' || apt.status === 'checked_in' || apt.status === 'administered') && 
      new Date(apt.scheduled_at) >= new Date()
    ).length || 0;

    return {
      completedVaccines: completed,
      upcomingAppointments: upcoming
    };
  }, [appointmentHistory, appointments]);

  const [healthNews, setHealthNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState(null)
  const [failedImages, setFailedImages] = useState(new Set())

  // Load data initial only
  useEffect(() => {
    getAppointmentHistory()
    getCitizenAppointments()
    fetchHealthNews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) 

  const fetchHealthNews = async () => {
    setNewsLoading(true)
    setNewsError(null)
    try {
      const response = await axiosInstance.get('/news')
      setHealthNews(response.data.articles || [])
    } catch (error) {
      console.error('Error fetching vaccine news:', error)
      setNewsError(error.response?.data?.message || 'Failed to load vaccine news')
    } finally {
      setNewsLoading(false)
    }
  }

  const formatNewsDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const truncateText = (text, maxLength) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
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
      case 'booked': return { text: 'Booked', color: 'bg-blue-500' }
      case 'checked_in': return { text: 'Checked In', color: 'bg-yellow-500' }
      case 'completed': return { text: 'Completed', color: 'bg-green-500' }
      case 'cancelled': return { text: 'Cancelled', color: 'bg-red-500' }
      case 'no_show': return { text: 'No Show', color: 'bg-gray-500' }
      default: return { text: 'Unknown', color: 'bg-gray-400' }
    }
  }

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

        {/* Main Grid - News and Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vaccine News - Expanded */}
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Newspaper className="h-6 w-6 text-teal-600" />
                <h2 className="text-xl font-semibold text-gray-800">Vaccine News</h2>
              </div>
              <button
                onClick={fetchHealthNews}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Refresh
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
              {newsLoading ? (
                // Skeleton Loader
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : newsError ? (
                // Error State
                <div className="text-center py-10">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-500 text-sm font-medium mb-2">Failed to load news</p>
                  <p className="text-gray-500 text-xs">{newsError}</p>
                  <button
                    onClick={fetchHealthNews}
                    className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              ) : healthNews.length > 0 ? (
                // News Cards
                healthNews.map((article, index) => (
                  <div
                    key={index}
                    className="group border border-gray-200 rounded-lg p-3 hover:border-teal-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {article.urlToImage && !failedImages.has(index) ? (
                          <img
                            src={article.urlToImage}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={() => {
                              setFailedImages(prev => new Set([...prev, index]))
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Newspaper className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors">
                          {truncateText(article.title, 80)}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {formatNewsDate(article.publishedAt)} • {article.source}
                        </p>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
                        >
                          Read more
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // No News State
                <div className="text-center py-10">
                  <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No vaccine news available</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Upcoming Appointments</h2>
                </div>
              </div>

              {isLoadingAppointments ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : appointments && appointments.filter(apt => 
                  (apt.status === 'booked' || apt.status === 'checked_in' || apt.status === 'administered') && 
                  new Date(apt.scheduled_at) >= new Date()
                ).length > 0 ? (
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {appointments
                    .filter(apt => 
                      (apt.status === 'booked' || apt.status === 'checked_in' || apt.status === 'administered') && 
                      new Date(apt.scheduled_at) >= new Date()
                    )
                    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
                    .slice(0, 4)
                    .map((appointment) => {
                      const { time } = formatDate(appointment.scheduled_at)
                      const statusInfo = getStatusInfo(appointment.status)
                      const vaccineCount = appointment.vaccines?.length || 0
                      
                      return (
                        <div key={appointment.id} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/appointment')}>
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                              <span className="text-xs font-medium text-blue-600">
                                {new Date(appointment.scheduled_at).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                              </span>
                              <span className="text-lg font-bold text-gray-900">
                                {new Date(appointment.scheduled_at).getDate()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-block w-2 h-2 rounded-full ${statusInfo.color}`}></span>
                                <p className="font-semibold text-gray-800">Appointment #{appointment.id}</p>
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{time}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Syringe className="h-3 w-3" />
                                <span>{vaccineCount} vaccine{vaccineCount !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No upcoming appointments</p>
                  <p className="text-sm text-gray-400 mt-1">Book an appointment to get started</p>
                  <button
                    onClick={() => navigate('/booking')}
                    className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Book Now
                  </button>
                </div>
              )}

              {appointments && appointments.filter(apt => 
                  (apt.status === 'booked' || apt.status === 'checked_in' || apt.status === 'administered') && 
                  new Date(apt.scheduled_at) >= new Date()
                ).length > 0 && (
                <button
                  onClick={() => navigate('/appointment')}
                  className="mt-4 w-full px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg border border-blue-200 transition flex items-center justify-center gap-2"
                >
                  View All Appointments
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Help Button - Đã sửa lỗi syntax comment */}
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