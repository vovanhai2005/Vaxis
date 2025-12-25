import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import BillModal from '../../components/BillModal';
import { Calendar, Search, Filter, Loader2, 
  Syringe,User,Clock,Phone,MapPin,ChevronLeft,
  ChevronRight,ChevronsLeft,ChevronsRight,StickyNote,CheckCircle,
  XCircle,Eye,Thermometer,Activity,AlertCircle,ClipboardCheck,X
} from 'lucide-react';
import { axiosInstance } from '../../lib/axios';
import toast from 'react-hot-toast';

const UpcomingAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInData, setCheckInData] = useState({
    temperature: '',
    blood_pressure: '',
    notes: '',
    allergies: '',
    current_medications: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billData, setBillData] = useState(null);
  const [isAdministrationModalOpen, setIsAdministrationModalOpen] = useState(false);
  const [administrationData, setAdministrationData] = useState({
    doseNumber: '',
    adverseEvents: ''
  });
  const [isBillPaid, setIsBillPaid] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get('/appointments/upcoming');
      setAppointments(res.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = (appointment) => {
    setSelectedAppointment(appointment);
    setCheckInData({
      temperature: '',
      blood_pressure: '',
      notes: '',
      allergies: '',
      current_medications: ''
    });
    setIsCheckInModalOpen(true);
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!checkInData.temperature || !checkInData.blood_pressure) {
      toast.error('Temperature and blood pressure are required');
      return;
    }

    const temp = parseFloat(checkInData.temperature);
    const bp = parseInt(checkInData.blood_pressure);

    if (temp < 35 || temp > 42) {
      toast.error('Please enter a valid temperature (35-42°C)');
      return;
    }

    if (bp < 60 || bp > 200) {
      toast.error('Please enter a valid blood pressure (60-200 mmHg)');
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.put(`/appointments/${selectedAppointment.id}/status`, {
        temperature: temp,
        blood_pressure: bp,
        notes: checkInData.notes || null,
        allergies: checkInData.allergies || null,
        current_medications: checkInData.current_medications || null
      });
      toast.success('Checked in successfully!');
      setIsCheckInModalOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error(error.response?.data?.message || 'Failed to check in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckInInputChange = (e) => {
    const { name, value } = e.target;
    setCheckInData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'administered':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'checked_in':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'booked':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      apt.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.national_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.vaccine_names?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = async (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
    
    // If appointment is administered, check if bill is paid
    if (appointment.status === 'administered') {
      try {
        const billResponse = await axiosInstance.get(`/administration/${appointment.id}/bill`);
        setIsBillPaid(billResponse.data.paid || false);
      } catch (error) {
        console.error('Error fetching bill status:', error);
        setIsBillPaid(false);
      }
    } else {
      setIsBillPaid(false);
    }
  };

  const handleCreateAdministration = (appointment) => {
    setSelectedAppointment(appointment);
    setAdministrationData({
      doseNumber: '',
      adverseEvents: ''
    });
    setIsAdministrationModalOpen(true);
  };

  const handleAdministrationSubmit = async (e) => {
    e.preventDefault();

    if (!administrationData.doseNumber) {
      toast.error('Dose number is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.put(`/administration/${selectedAppointment.id}`, {
        doseNumber: parseInt(administrationData.doseNumber),
        adverseEvents: administrationData.adverseEvents || null
      });
      
      toast.success('Administration created successfully!');
      setIsAdministrationModalOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error creating administration:', error);
      toast.error(error.response?.data?.message || 'Failed to create administration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdministrationInputChange = (e) => {
    const { name, value } = e.target;
    setAdministrationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGetBill = async (appointmentId) => {
    try {
      const response = await axiosInstance.get(`/administration/${appointmentId}/bill`);
      const billDataResponse = response.data;
      
      setBillData(billDataResponse);
      setIsBillModalOpen(true);
      
      return billDataResponse;
    } catch (error) {
      console.error('Error getting bill:', error);
      toast.error(error.response?.data?.message || 'Failed to get bill');
      return null;
    }
  };

  const handlePayment = async () => {
    if (!selectedAppointment || !billData) return;

    try {
      await axiosInstance.put(`/administration/${selectedAppointment.id}/bill`);
      toast.success('Payment processed successfully!');
      
      // Update bill data and paid status
      setBillData({ ...billData, paid: true });
      setIsBillPaid(true);
      
      // Refresh appointments to show updated status
      fetchAppointments();
      
      // Close bill modal
      setIsBillModalOpen(false);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await axiosInstance.put(`/appointments/${appointmentId}/complete`);
      toast.success('Appointment completed successfully!');
      setIsDetailsModalOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to complete appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30 pb-10">
      <Header
        title="Upcoming Appointments"
        subtitle="Manage and check-in upcoming vaccination appointments"
        icon={Calendar}
      />

      <div className="px-6 mt-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
          
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="Search by name, ID, vaccine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-3 w-full md:w-auto relative">
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  className={`flex items-center justify-center px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                    isFilterOpen || statusFilter
                      ? 'bg-teal-50 border-teal-200 text-teal-700'
                      : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>

                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="font-semibold text-gray-700">Filter by Status</span>
                        <button 
                          onClick={() => {
                            setStatusFilter('');
                            setIsFilterOpen(false);
                          }} 
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Reset
                        </button>
                      </div>
                      
                      <div>
                        <select
                          className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border bg-white text-gray-900 focus:outline-none"
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setIsFilterOpen(false);
                          }}
                        >
                          <option value="">All Statuses</option>
                          <option value="booked">Booked</option>
                          <option value="checked_in">Checked In</option>
                          <option value="administered">Administered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={fetchAppointments}
                className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 shadow-lg transition-all hover:scale-105"
              >
                <Clock className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-grow">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase w-10">No</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Citizen Name</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Vaccines</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Scheduled At</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Notes</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Status</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center text-gray-500 h-[400px]">
                      <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
                        <span className="text-sm font-medium">Loading appointments...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentAppointments.length > 0 ? (
                  currentAppointments.map((appointment, index) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium">
                        {String(startIndex + index + 1).padStart(3, '0')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm border-l border-gray-100">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{appointment.citizen_name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 border-l border-gray-100">
                        <div className="flex items-center gap-2">
                          <Syringe className="h-4 w-4 text-teal-500" />
                          <span>{appointment.vaccine_names || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(appointment.time)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-l border-gray-100 font-mono">
                        {appointment.notes || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm border-l border-gray-100">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium border-l border-gray-100">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(appointment)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {appointment.status === 'booked' && (
                            <button
                              onClick={() => handleCheckIn(appointment)}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                              title="Check In"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500 italic">
                      No appointments found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-auto">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAppointments.length)} of {filteredAppointments.length} appointments
            </div>
            
            <div className="flex gap-1">
              <button 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsLeft size={16} />
              </button>

              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                .map(number => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`px-3 py-1 border rounded text-sm font-medium ${
                      currentPage === number 
                        ? 'bg-teal-700 text-white border-teal-700' 
                        : 'border-teal-300 hover:bg-teal-100 text-gray-700'
                    }`}
                  >
                    {number}
                  </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>

              <button 
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage >= totalPages}
                className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Appointment Details</h3>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Citizen Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="text-teal-600" />
                  Citizen Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Full Name:</span>
                    <p className="text-gray-900">{selectedAppointment.citizen_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">National ID:</span>
                    <p className="text-gray-900 font-mono">{selectedAppointment.national_id || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Phone:</span>
                    <p className="text-gray-900">{selectedAppointment.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Address:</span>
                    <p className="text-gray-900">{selectedAppointment.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="text-teal-600" />
                  Appointment Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 font-medium">Scheduled:</span>
                    <span className="text-gray-900">{formatDate(selectedAppointment.time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 font-medium">Vaccines:</span>
                    <span className="text-gray-900">{selectedAppointment.vaccine_names || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Status:</span>
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                  {selectedAppointment.notes && (
                    <div className="flex items-start gap-2">
                      <StickyNote className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <span className="text-gray-600 font-medium">Notes:</span>
                        <p className="text-gray-900 mt-1">{selectedAppointment.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 pt-4 flex gap-3">
                {selectedAppointment.status === 'booked' && (
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleCheckIn(selectedAppointment);
                    }}
                    className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium"
                  >
                    Check In
                  </button>
                )}
                {selectedAppointment.status === 'checked_in' && (
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleCreateAdministration(selectedAppointment);
                    }}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Create Administration
                  </button>
                )}
                {selectedAppointment.status === 'administered' && (
                  <button
                    onClick={async () => {
                      await handleGetBill(selectedAppointment.id);
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Get Bill
                  </button>
                )}
                {selectedAppointment.status === 'administered' && isBillPaid && (
                  <button
                    onClick={() => handleCompleteAppointment(selectedAppointment.id)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                  >
                    Complete
                  </button>
                )}
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Check-In Form Modal */}
      {isCheckInModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardCheck className="text-teal-600" size={28} />
                    Check-In Form
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Patient: <span className="font-semibold">{selectedAppointment.citizen_name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsCheckInModalOpen(false)}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCheckInSubmit} className="p-6">
              <div className="space-y-6">
                {/* Vital Signs Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity className="text-teal-600" size={20} />
                    Vital Signs
                    <span className="text-red-500 text-sm">*</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Temperature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-gray-400" />
                          Temperature (°C)
                          <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <input
                        type="number"
                        name="temperature"
                        value={checkInData.temperature}
                        onChange={handleCheckInInputChange}
                        step="0.1"
                        min="35"
                        max="42"
                        placeholder="36.5"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Normal range: 36.1-37.2°C</p>
                    </div>

                    {/* Blood Pressure */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          Blood Pressure (Systolic)
                          <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <input
                        type="number"
                        name="blood_pressure"
                        value={checkInData.blood_pressure}
                        onChange={handleCheckInInputChange}
                        min="60"
                        max="200"
                        placeholder="120"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Normal range: 90-120 mmHg</p>
                    </div>
                  </div>
                </div>

                {/* Health Screening Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="text-blue-600" size={20} />
                    Health Screening
                    <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                  </h4>

                  <div className="space-y-4">
                    {/* Allergies */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Known Allergies
                      </label>
                      <input
                        type="text"
                        name="allergies"
                        value={checkInData.allergies}
                        onChange={handleCheckInInputChange}
                        placeholder="e.g., Penicillin, Peanuts, None"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    {/* Current Medications */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Medications
                      </label>
                      <input
                        type="text"
                        name="current_medications"
                        value={checkInData.current_medications}
                        onChange={handleCheckInInputChange}
                        placeholder="e.g., Aspirin, Insulin, None"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <StickyNote className="w-4 h-4 text-gray-400" />
                          Additional Notes
                        </div>
                      </label>
                      <textarea
                        name="notes"
                        value={checkInData.notes}
                        onChange={handleCheckInInputChange}
                        rows="3"
                        placeholder="Any other relevant information..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Warning Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-800 mb-1">Important Reminders</p>
                      <ul className="text-yellow-700 space-y-1 list-disc list-inside">
                        <li>Ensure all vital signs are accurately measured</li>
                        <li>Verify patient identity before check-in</li>
                        <li>Review patient's medical history for contraindications</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCheckInModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Complete Check-In
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Administration Modal */}
      {isAdministrationModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardCheck className="text-purple-600" size={28} />
                    Create Administration Record
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Patient: <span className="font-semibold">{selectedAppointment.citizen_name}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsAdministrationModalOpen(false)}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAdministrationSubmit} className="p-6">
              <div className="space-y-6">
                {/* Administration Details */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Syringe className="text-purple-600" size={20} />
                    Administration Details
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Dose Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dose Number
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="number"
                        name="doseNumber"
                        value={administrationData.doseNumber}
                        onChange={handleAdministrationInputChange}
                        min="1"
                        max="10"
                        placeholder="e.g., 1, 2, 3"
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Which dose of this vaccine is being administered?</p>
                    </div>

                    {/* Adverse Events */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adverse Events / Reactions
                        <span className="text-xs text-gray-500 font-normal ml-2">(Optional)</span>
                      </label>
                      <textarea
                        name="adverseEvents"
                        value={administrationData.adverseEvents}
                        onChange={handleAdministrationInputChange}
                        rows="4"
                        placeholder="Describe any adverse events or reactions observed..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm">
                      <p className="font-semibold text-blue-800 mb-1">Important</p>
                      <p className="text-blue-700">
                        Creating this administration record will generate a bill for the patient. Make sure all information is accurate before proceeding.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdministrationModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Create Administration
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Modal */}
      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        billData={billData}
        onPayment={handlePayment}
      />
    </div>
  );
};

export default UpcomingAppointmentsPage;