import React, { useState, useCallback } from "react";
import { axiosInstance } from "../../lib/axios";
import VaccinationDetails from "../../components/VaccinationDetails";
import Header from "../../components/Header";
import {
  Search, Loader2, Syringe, Calendar, User, Thermometer,
  FileText, AlertTriangle, Hash, MapPin, Phone, Droplet,
  CalendarDays, UserCircle, Mail, Activity,
  DollarSign
} from "lucide-react";
import toast from "react-hot-toast";

const LookUpCitizenProfile = () => {
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");
  const [citizen, setCitizen] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Use the new API
  const lookupCitizen = async (nationalId, email) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (nationalId) params.append('nationalId', nationalId);
      if (email) params.append('email', email);
      const res = await axiosInstance.get(`/administration/search/?${params.toString()}`);
      setCitizen(res.data.citizen || null);
      setAppointments(res.data.appointments || []);
      toast.success("Search completed");
    } catch (error) {
      toast.error("Error searching for citizen profile");
      setCitizen(null);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback((e) => {
    e?.preventDefault();
    const trimmedId = nationalId.trim();
    const trimmedEmail = email.trim();
    if (!trimmedId && !trimmedEmail) {
      toast.error("Please enter a National ID or Email");
      return;
    }
    lookupCitizen(trimmedId, trimmedEmail);
  }, [nationalId, email]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  }, [handleSearch]);

  const handleViewDetails = useCallback((record) => {
    setSelectedRecord(record);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30 pb-10">
      <Header
        title="Lookup Citizen Profile"
        subtitle="Search and view citizen vaccination records"
        icon={Search}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <SearchSection
          nationalId={nationalId}
          setNationalId={setNationalId}
          email={email}
          setEmail={setEmail}
          handleSearch={handleSearch}
          handleKeyDown={handleKeyDown}
          isLoading={isLoading}
        />

        {isLoading && <LoadingState />}

        {!isLoading && hasSearched && !citizen && (
          <EmptyState nationalId={nationalId} />
        )}

        {!isLoading && citizen && (
          <ResultsSection
            citizen={citizen}
            appointments={appointments}
            handleViewDetails={handleViewDetails}
          />
        )}

        <VaccinationDetails
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          data={selectedRecord}
          citizen={citizen}
        />
      </div>
    </div>
  );
};

// Utility Functions
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US");
};

const getStatusBadge = (status) => {
  const statusConfig = {
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
    booked: { label: 'Booked', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    checked_in: { label: 'Checked In', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
  };
  
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
};

// Search Section Component
const SearchSection = React.memo(({ nationalId, setNationalId, email, setEmail, handleSearch, handleKeyDown, isLoading }) => (
  <div className="max-w-2xl mx-auto mb-8">
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Enter National ID (e.g., 123456789)"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 pl-10 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              disabled={isLoading}
              maxLength={20}
            />
            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="email"
              placeholder="Or enter Email (e.g., user@example.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 pl-10 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              disabled={isLoading}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button
            type="submit"
            disabled={isLoading || (!nationalId.trim() && !email.trim())}
            className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Search
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
));

SearchSection.displayName = 'SearchSection';

// Loading State Component
const LoadingState = React.memo(() => (
  <div className="flex flex-col items-center justify-center py-20">
    <Loader2 className="w-12 h-12 animate-spin text-teal-600 mb-4" />
    <p className="text-gray-600 font-medium">Searching for citizen...</p>
  </div>
));

LoadingState.displayName = 'LoadingState';

// Empty State Component
const EmptyState = React.memo(({ nationalId }) => (
  <div className="max-w-2xl mx-auto">
    <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Citizen Found</h3>
      <p className="text-gray-500">
        No records found for the provided search criteria
      </p>
      <p className="text-sm text-gray-400 mt-2">Please verify the information and try again.</p>
    </div>
  </div>
));

EmptyState.displayName = 'EmptyState';

// Results Section Component
const ResultsSection = React.memo(({ citizen, appointments, handleViewDetails }) => (
  <div className="max-w-5xl mx-auto space-y-6">
    <ProfileCard citizen={citizen} />
    <VaccinationHistoryCard appointments={appointments} handleViewDetails={handleViewDetails} />
  </div>
));

ResultsSection.displayName = 'ResultsSection';

// Profile Card Component
const ProfileCard = React.memo(({ citizen }) => {
  const profileFields = [
    { icon: User, label: 'Full Name', value: citizen.full_name },
    { icon: Phone, label: 'Phone Number', value: citizen.phone },
    { icon: CalendarDays, label: 'Date of Birth', value: formatDate(citizen.dob) },
    { icon: User, label: 'Gender', value: citizen.gender, capitalize: true },
    { icon: Droplet, label: 'Blood Type', value: citizen.blood_type },
    { icon: Mail, label: 'Email', value: citizen.email },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <UserCircle className="text-teal-600 h-6 w-6" />
          Citizen Information
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          Active Profile
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profileFields.map((field, index) => (
          <ProfileField key={index} {...field} />
        ))}
        <div className="p-3 bg-gray-50 rounded-lg md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
            <MapPin className="w-3 h-3" />
            <span className="font-medium">Address</span>
          </div>
          <p className="text-gray-900 font-semibold">{citizen.address || "N/A"}</p>
        </div>
      </div>
    </div>
  );
});

ProfileCard.displayName = 'ProfileCard';

// Profile Field Component
const ProfileField = React.memo(({ icon: Icon, label, value, capitalize }) => (
  <div className="p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
      <Icon className="w-3 h-3" />
      <span className="font-medium">{label}</span>
    </div>
    <p className={`text-gray-900 font-semibold ${capitalize ? 'capitalize' : ''}`}>
      {value || "N/A"}
    </p>
  </div>
));

ProfileField.displayName = 'ProfileField';

// Vaccination History Card Component
const VaccinationHistoryCard = React.memo(({ appointments, handleViewDetails }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <Syringe className="text-teal-600 h-6 w-6" />
        Vaccination History
      </h3>
      <span className="text-sm text-gray-500 font-medium">
        {appointments.length} {appointments.length === 1 ? 'Record' : 'Records'}
      </span>
    </div>

    <div className="space-y-4">
      {appointments.map((item, index) => (
        <VaccinationRecord 
          key={item.id || item.appointment_id || index} 
          item={item} 
          index={index} 
          handleViewDetails={handleViewDetails}
        />
      ))}
    </div>
  </div>
));

VaccinationHistoryCard.displayName = 'VaccinationHistoryCard';

// Vaccination Record Component
const VaccinationRecord = React.memo(({ item, index, handleViewDetails }) => {
  // If vaccines is an array of objects (from backend), join names
  let vaccines = [];
  if (Array.isArray(item.vaccines)) {
    vaccines = item.vaccines;
  } else if (item.vaccine_names) {
    vaccines = item.vaccine_names.split(",").map((v) => ({ name: v.trim() }));
  }

  // Calculate total price (sum all vaccine.price if present and numeric)
  const totalPrice = vaccines.reduce((sum, v) => {
    const price = typeof v.price === "number" ? v.price : parseFloat(v.price);
    return !isNaN(price) ? sum + price : sum;
  }, 0);

  return (
    <div className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">Vaccination #{index + 1}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {formatDate(item.scheduled_at || item.time)}
          </div>
        </div>
        {getStatusBadge(item.status)}
      </div>

      {vaccines.length > 0 && (
        <div className="mb-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vaccines</span>
          <div className="flex flex-col gap-2 mt-2">
            {vaccines.map((v, idx) => (
              <div key={idx} className="bg-teal-50 border border-teal-200 rounded-lg p-2 mb-1">
                <div className="flex items-center gap-2 mb-1">
                  <Syringe className="w-3 h-3" />
                  <span className="font-semibold text-teal-700">{v.name}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(v).map(([key, value]) => (
                    // Exclude 'name', 'id', and 'price'
                    key !== "name" && key !== "id" && key !== "price" && (
                      <DetailItem
                        key={key}
                        icon={FileText}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={value}
                      />
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Show total price if any vaccine has price */}
          {totalPrice > 0 && (
            <div className="flex items-center gap-2 mt-2 text-teal-700 font-semibold">
              <DollarSign className="w-4 h-4" />
              Total Price: {totalPrice.toLocaleString()} VND
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <DetailItem icon={Hash} label="Dose" value={item.dose_number} />
        <DetailItem icon={Thermometer} label="Temperature" value={item.temperature ? `${item.temperature}°C` : null} />
        <DetailItem icon={AlertTriangle} label="Adverse Events" value={item.adverse_events || 'None'} />
        <DetailItem icon={FileText} label="Bill ID" value={item.bill_id ? `#${item.bill_id}` : null} />
        <DetailItem icon={User} label="Administered By" value={item.administered_by || 'N/A'} />
      </div>

      {item.status === "completed" && (
        <button
          onClick={() => handleViewDetails(item)}
          className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
        >
          View Full Details
        </button>
      )}
    </div>
  );
});

VaccinationRecord.displayName = 'VaccinationRecord';

// Detail Item Component
const DetailItem = React.memo(({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2">
    <Icon className="w-4 h-4 text-gray-400" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900">{value || 'N/A'}</p>
    </div>
  </div>
));

DetailItem.displayName = 'DetailItem';

export default LookUpCitizenProfile;