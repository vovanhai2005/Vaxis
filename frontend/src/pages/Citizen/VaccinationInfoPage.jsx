import React, { useState, useEffect } from 'react'
import { Search, ShoppingCart, Bell, Info, Calendar, Loader2, ShoppingCartIcon, X, Shield, Factory, DollarSign, Pill } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useVaccineStore } from '../../store/useVaccineStore'
import { Link } from 'react-router-dom'

const VaccineDetailModal = ({ vaccine, onClose }) => {
  if (!vaccine) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-7 w-7" />
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8">
            <p className="text-teal-500 bg-teal-50 text-sm font-bold px-4 py-2 rounded-full self-start inline-block">{vaccine.disease_type}</p>
            <h2 className="font-bold text-3xl text-gray-800 mt-4">{vaccine.name}</h2>
            <p className="text-gray-600 text-md mt-2">{vaccine.description}</p>

            <div className="mt-6 space-y-4 text-gray-700">
              <div className="flex items-center gap-3">
                <Factory className="h-5 w-5 text-gray-500" />
                <span><strong>Manufacturer:</strong> {vaccine.manufacturer || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Pill className="h-5 w-5 text-gray-500" />
                <span><strong>Doses Required:</strong> {vaccine.doses_required || 1}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-500" />
                <span><strong>Efficacy Rate:</strong> {vaccine.efficacy_rate ? `${vaccine.efficacy_rate}%` : 'N/A'}</span>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-teal-600 font-bold text-4xl">${parseFloat(vaccine.price).toFixed(2)}</p>
            </div>
          </div>
          <div className="hidden md:block">
            <img src={vaccine.image_url || '/src/asset/vaccine_demo.png'} alt={vaccine.name} className="h-full w-full object-cover rounded-r-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

const VaccineCard = ({ vaccine, onViewDetail }) => {
  const addVaccineToCart = useVaccineStore(state => state.addVaccineToCart)

  const handleAddToCart = () => {
    addVaccineToCart(vaccine)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden transition-transform duration-300 hover:transform hover:-translate-y-2 flex flex-col">
      <img src={vaccine.image_url || '/src/asset/vaccine_demo.png'} alt={vaccine.name} className="h-48 w-full object-cover" />
      <div className="p-6 flex-grow flex flex-col">
        <p className="text-teal-500 bg-teal-50 text-xs font-bold px-3 py-1 rounded-full self-start">{vaccine.disease_type}</p>
        <h3 className="font-bold text-xl text-gray-800 mt-3">{vaccine.name}</h3>
        <p className="text-gray-500 text-sm mt-1 flex-grow">{vaccine.description}</p>
        <p className="text-teal-600 font-bold text-2xl mt-4">${parseFloat(vaccine.price).toFixed(2)}</p>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={() => onViewDetail(vaccine)}
            className="bg-white border border-teal-500 text-teal-600 font-semibold py-3 rounded-lg hover:bg-teal-50 transition flex items-center justify-center gap-2"
          >
            <Info className="h-4 w-4" />
            View Detail
          </button>
          <button
            onClick={handleAddToCart}
            className="bg-teal-500 text-white font-semibold py-3 rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-2"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            Add to cart
          </button>
        </div>
      </div>
    </div>
  )
}

const VaccinationInfoPage = () => {
  const { authUser } = useAuthStore()
  const { vaccines, isLoadingVaccines, getVaccines } = useVaccineStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVaccine, setSelectedVaccine] = useState(null)

  useEffect(() => {
    getVaccines()
  }, [getVaccines])

  const filteredVaccines = vaccines.filter(vaccine => {
    const nameMatch = vaccine.name && vaccine.name.toLowerCase().includes(searchTerm.toLowerCase())
    const diseaseMatch = vaccine.disease_type && vaccine.disease_type.toLowerCase().includes(searchTerm.toLowerCase())
    return nameMatch || diseaseMatch
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vaccination Information</h1>
          <p className="text-gray-500">Browse and book available vaccines</p>
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

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for vaccines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-12 pr-4 py-4 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
        </div>
      </div>

      {/* Vaccine Grid */}
      {isLoadingVaccines ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVaccines.map(vaccine => (
            <VaccineCard key={vaccine.id} vaccine={vaccine} onViewDetail={setSelectedVaccine} />
          ))}
        </div>
      )}

      {/* Modal */}
      <VaccineDetailModal vaccine={selectedVaccine} onClose={() => setSelectedVaccine(null)} />

      {/* Help Button */}
      <button className="fixed bottom-8 right-8 bg-gray-800 hover:bg-gray-900 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition">
        <span className="text-xl">?</span>
      </button>
    </div>
  )
}

export default VaccinationInfoPage
