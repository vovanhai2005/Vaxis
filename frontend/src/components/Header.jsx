import React, { useState, useRef, useEffect } from 'react'
import { ShoppingCart, Bell, Calendar, X, Check, Clock, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useVaccineStore } from '../store/useVaccineStore'
import { useUserStore } from '../store/useUserStore'
import { useNotificationStore } from '../store/useNotificationStore'

const Header = ({ title, subtitle, icon: Icon = Calendar }) => {
  const navigate = useNavigate()
  const { authUser } = useAuthStore()
  const { userProfile } = useUserStore()
  const { selectedVaccines } = useVaccineStore()
  const { notifications, unreadCount, getNotifications, getUnreadCount, markAsRead } = useNotificationStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  useEffect(() => {
    if (authUser) {
      getUnreadCount()
      // Refresh unread count every 30 seconds
      const interval = setInterval(() => {
        getUnreadCount()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [authUser, getUnreadCount])

  useEffect(() => {
    if (showNotifications) {
      getNotifications({ limit: 10 })
    }
  }, [showNotifications, getNotifications])

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
    // Navigate based on notification type if needed
    if (notification.link) {
      navigate(notification.link)
      setShowNotifications(false)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <Check className="h-5 w-5 text-green-600" />
      case 'reminder':
        return <Clock className="h-5 w-5 text-amber-600" />
      case 'announcement':
        return <AlertCircle className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'bg-green-50'
      case 'reminder':
        return 'bg-amber-50'
      case 'announcement':
        return 'bg-blue-50'
      default:
        return 'bg-gray-50'
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)
    
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title and Subtitle with Icon */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              {Icon && <Icon className="h-6 w-6 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-500 text-sm">{subtitle}</p>
            </div>
          </div>

          {/* Right: Cart, Bell, and Avatar */}
          <div className="flex items-center gap-3">
            {authUser?.role?.toLowerCase() === 'citizen' && (
              <>
                <button
                  type="button"
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition relative border border-gray-200"
                  onClick={() => navigate('/booking')}
                >
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  {selectedVaccines.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-sm">
                      {selectedVaccines.length}
                    </span>
                  )}
                </button>
              </>
            )}
            
            {/* Notifications for all roles */}
            {authUser && (
              <div className="relative" ref={notificationRef}>
                <button 
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition relative border border-gray-200"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                      <div>
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <p className="text-xs text-gray-500">{unreadCount} unread</p>
                      </div>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="p-1 hover:bg-gray-200 rounded-lg transition"
                      >
                          <X className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Notifications List */}
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="text-center py-12">
                            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                                  !notification.is_read ? 'bg-teal-50/30' : ''
                                }`}
                              >
                                <div className="flex gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationBgColor(notification.type)}`}>
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <h4 className="font-semibold text-sm text-gray-900">
                                        {notification.title}
                                      </h4>
                                      {!notification.is_read && (
                                        <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1"></span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatTimeAgo(notification.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                          <button 
                            onClick={() => {
                              setShowNotifications(false)
                              // Navigate to notifications page if exists
                            }}
                            className="w-full text-center text-sm font-medium text-teal-600 hover:text-teal-700 transition"
                          >
                            View all notifications
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{authUser?.full_name || authUser?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{authUser?.role || 'Citizen'}</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-teal-500/20 ring-2 ring-teal-500/20">
                <img
                  src={userProfile?.profile_picture || authUser?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.full_name || authUser?.username || 'U')}&background=0d9488&color=fff&size=48`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
