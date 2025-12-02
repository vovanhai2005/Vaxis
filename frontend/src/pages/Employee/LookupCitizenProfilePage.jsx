import React, { useState } from "react";
import { useLookUpStore } from "../../store/useLookupStore";
import VaccinationDetails from "../../components/VaccinationDetails";
import Header from "../../components/Header";
import {Search, Loader2, Syringe, Calendar, User, StickyNote, Thermometer, FileText, AlertTriangle, Hash, MapPin, Phone, Droplet, CalendarDays, UserCircle,} from "lucide-react";

const LookUpCitizenProfile = () => {
  const [nationalId, setNationalId] = useState("");
  const { lookupResults, lookupCitizen, isLoading } = useLookUpStore();

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const profile = lookupResults.length > 0 ? lookupResults[0] : null;

  const handleSearch = () => {
    if (!nationalId.trim()) return;
    lookupCitizen(nationalId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30">
      <Header
        title="Lookup Citizen Profile"
        subtitle="View citizen information and vaccination history"
        icon={Search}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          {/* Search */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter National ID"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="flex-1 p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Search className="h-5 w-5" />}
              Search
            </button>
          </div>

        {/* States */}
        <div className="mt-8">
          {isLoading && (
            <div className="text-center py-10">
              <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
            </div>
          )}

          {!isLoading && lookupResults.length === 0 && (
            <p className="text-center text-gray-500 py-10">
              <strong>
              No citizen found.
              </strong>
            </p>
          )}

          {/* Profile Section */}
          {profile && (
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <UserCircle className="text-teal-600" />
                Citizen Information
              </h3>

              <div className="grid grid-cols-2 gap-4 text-gray-700 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <strong>Name:</strong> {profile.full_name}
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <strong>Phone:</strong> {profile.phone || "N/A"}
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <strong>DOB:</strong> {formatDate(profile.dob)}
                </div>

                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <strong>Gender:</strong> {profile.gender || "N/A"}
                </div>

                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4" />
                  <strong>Blood Type:</strong> {profile.blood_type || "N/A"}
                </div>

                <div className="flex items-center gap-2 col-span-2">
                  <MapPin className="w-4 h-4" />
                  <strong>Address:</strong> {profile.address || "N/A"}
                </div>
              </div>
            </div>
          )}

          {/* Vaccination History Section */}
          {lookupResults.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Syringe className="text-teal-600" />
                Vaccination History
              </h3>

              <div className="space-y-4">
                {lookupResults.map((item, index) => {
                  let vaccines = [];
                  if (item.vaccine_names) {
                    vaccines = item.vaccine_names.split(",").map((v) => v.trim());
                  }
                  const statusColors = {
                    completed: "text-green-600",
                    booked: "text-yellow-600",
                    checked_in: "text-blue-600",
                    cancelled: "text-red-600",
                  };
                  return (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      {/* Vaccine List */}
                      <div>
                        <strong className="text-gray-800">Vaccines:</strong>
                        <ul className="list-disc ml-5 text-gray-700">
                          {vaccines.map((v, idx) => (
                            <li key={idx}>{v}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <strong className="text-gray-600">Date: {formatDate(item.scheduled_at)}</strong>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2 text-sm">
                        <StickyNote className="w-4 h-4 text-gray-600" />
                        <strong className="text-gray-600">Status:</strong>
                        
                        <span
                          className={`font-bold ${
                            statusColors[item.status] || "text-gray-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Dose */}
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="w-4 h-4 text-gray-600" />
                        <strong className="text-gray-600">Dose Number:{item.dose_number}</strong> 
                      </div>

                      {/* Temperature */}
                      <div className="flex items-center gap-2 text-sm">
                        <Thermometer className="w-4 h-4 text-gray-600" />
                        <strong className="text-gray-600">Temperature: {item.temperature}°C</strong>
                      </div>

                      {/* Adverse Events */}
                      <div className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <strong className="text-gray-600">Adverse Events: {item.adverse_events || "None"}</strong>
                      </div>

                      {/* Bill ID */}
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <strong className="text-gray-600">Bill ID: #{item.bill_id}</strong>
                      </div>

                      {/* 👉 View Details Button (only completed) */}
                      {item.status === "completed" && (
                        <button
                          onClick={() => {
                            setSelectedRecord(item);
                            setIsDetailsOpen(true);
                          }}
                          className="mt-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* DIALOG DETAILS */}
        <VaccinationDetails
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          data={selectedRecord}
        />
        </div>
      </div>
    </div>
  );
};

export default LookUpCitizenProfile;
