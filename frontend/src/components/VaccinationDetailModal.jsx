import React from 'react'
import { X, Calendar, MapPin, Syringe, Building2, FileText, Clock, Shield, User, DownloadIcon } from 'lucide-react'

const VaccinationDetailModal = ({ vaccine, onClose }) => {
  if (!vaccine) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (status === 'Upcoming') return 'bg-blue-100 text-blue-700 border-blue-200'
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Syringe className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{vaccine.vaccine_name}</h2>
                <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm border ${
                  vaccine.status === 'Completed' 
                    ? 'bg-emerald-400/20 text-emerald-50 border-emerald-400/30' 
                    : 'bg-blue-400/20 text-blue-50 border-blue-400/30'
                }`}>
                  {vaccine.status || 'Completed'}
                </span>
              </div>
              <p className="text-teal-50 font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {vaccine.manufacturer}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Administration Details */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Administration Details
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Time Administered</p>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <Clock className="h-5 w-5 text-teal-500" />
                    {formatTime(vaccine.administered_at)}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Date Administered</p>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <Calendar className="h-5 w-5 text-teal-500" />
                    {formatDate(vaccine.administered_at)}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <MapPin className="h-5 w-5 text-teal-500" />
                    {vaccine.location || 'Main Vaccination Center'}
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Details */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Medical Information
              </h3>
              
              <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Administered By</p>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <User className="h-5 w-5 text-teal-500" />
                    {vaccine.administered_by || 'Certified Staff'}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Temperature</p>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <span className="text-2xl">🌡️</span>
                    {vaccine.temperature ? `${vaccine.temperature}°C` : 'Not recorded'}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Blood Pressure</p>
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <span className="text-2xl">❤️</span>
                    {vaccine.blood_pressure || 'Not recorded'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {vaccine.notes && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Notes</h3>
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-100 text-sm leading-relaxed">
                {vaccine.notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default VaccinationDetailModal
