import {User, Calendar, Syringe, Thermometer, AlertTriangle, FileText, MapPin, Hash, X, Download} from "lucide-react";

const VaccinationDetails = ({ isOpen, onClose, data, onDownload }) => {
  if (!isOpen || !data) return null;

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-US") : "N/A";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        {/* HEADER */}
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-teal-700 mb-1">
          <FileText className="w-6 h-6" />
          Vaccination Details
        </h2>
        <p className="text-gray-500 mb-6">
          Full record for <strong>{data.full_name}</strong>
        </p>

        {/* CITIZEN INFO */}
        <div className="bg-teal-50 p-4 rounded-lg border mb-6">
          <h3 className="font-semibold text-teal-800 flex items-center gap-2 mb-3">
            <User className="w-4 h-4" />
            Citizen Information
          </h3>

          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div>
              <span className="text-gray-500">Full Name</span>
              <p className="font-medium">{data.full_name}</p>
            </div>

            <div>
              <span className="text-gray-500">Phone</span>
              <p className="font-medium">{data.phone || "N/A"}</p>
            </div>

            <div>
              <span className="text-gray-500">Date of Birth</span>
              <p className="font-medium">{formatDate(data.dob)}</p>
            </div>

            <div>
              <span className="text-gray-500">Gender</span>
              <p className="font-medium">{data.gender || "N/A"}</p>
            </div>

            <div>
              <span className="text-gray-500">Blood Type</span>
              <p className="font-medium">{data.blood_type || "N/A"}</p>
            </div>

            <div className="col-span-2">
              <span className="text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Address
              </span>
              <p className="font-medium">{data.address || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* VACCINATION INFO */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
            <Syringe className="w-4 h-4 text-teal-600" />
            Vaccine Information
          </h3>

          <div className="bg-gray-50 border rounded-lg p-4 space-y-2 text-sm">
            <div>
              <span className="font-bold text-gray-600">Vaccines</span>
              <ul className="list-disc ml-6 text-gray-800">
                {data.vaccine_names
                  .split(",")
                  .map((v, i) => <li key={i}>{v.trim()}</li>)}
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="font-bold text-gray-600">Date:</span>
              <p className="font-bold text-gray-600">{formatDate(data.scheduled_at)}</p>
            </div>

            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-600" />
              <span className="font-bold text-gray-600">Dose Number:</span>
              <p className="font-bold text-gray-600">{data.dose_number}</p>
            </div>
          </div>
        </div>

        {/* HEALTH CHECK */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-teal-600" />
            Health Check & Follow-up
          </h3>

          <div className="bg-gray-50 border rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 font-bold flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                Temperature
              </p>
              <p className="font-bold text-gray-500">{data.temperature}°C</p>
            </div>

            <div>
              <p className="text-gray-600 font-bold">Adverse Events</p>
              <p className="font-bold text-gray-500">{data.adverse_events || "None"}</p>
            </div>

            <div>
              <p className="text-gray-600 font-bold">Bill ID</p>
              <p className="font-bold text-gray-500">#{data.bill_id}</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            Close
          </button>

          <button
            onClick={() => onDownload && onDownload(data)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            disabled={!onDownload}
          >
            <Download className="w-4 h-4" />
            Download Certificate
          </button>
        </div>

      </div>
    </div>
  );
};

export default VaccinationDetails;
