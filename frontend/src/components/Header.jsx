import React from 'react'
import { ShoppingCart, Bell, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useVaccineStore } from '../store/useVaccineStore'
import { useUserStore } from '../store/useUserStore'

const Header = ({ title, subtitle, icon: Icon = Calendar, notificationCount = 3 }) => {
  const navigate = useNavigate()
  const { authUser } = useAuthStore()
  const { userProfile } = useUserStore()
  const { selectedVaccines } = useVaccineStore()

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
                <button className="p-2.5 hover:bg-gray-100 rounded-xl transition relative border border-gray-200">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-sm">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
                <div className="h-8 w-px bg-gray-200"></div>
              </>
            )}
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
