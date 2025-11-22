import React from 'react'
import { ShoppingCart, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useVaccineStore } from '../store/useVaccineStore'
import { useUserStore } from '../store/useUserStore'

const Header = ({ title, subtitle, notificationCount = 3 }) => {
  const navigate = useNavigate()
  const { authUser } = useAuthStore()
  const { userProfile } = useUserStore()
  const { selectedVaccines } = useVaccineStore()

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
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
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{authUser?.full_name || authUser?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{authUser?.role || 'Citizen'}</p>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img
              src={userProfile?.profile_picture || authUser?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.full_name || authUser?.username || 'U')}&background=0d9488&color=fff&size=48`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
