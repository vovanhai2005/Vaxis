import { useRef } from "react";
import {
  User, Calendar, Syringe, Thermometer, AlertTriangle, FileText, MapPin, Hash, X, Download, DollarSign
} from "lucide-react";
import VaccinationCertificateTemplate from "./VaccinationCertificateTemplate";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

const VaccinationDetails = ({ isOpen, onClose, data, citizen }) => {
  const certificateRef = useRef();

  if (!isOpen || !data || !citizen) return null;

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-US") : "N/A";

  // Prepare vaccines array
  let vaccines = [];
  if (Array.isArray(data.vaccines)) {
    vaccines = data.vaccines;
  } else if (data.vaccine_names) {
    vaccines = data.vaccine_names.split(",").map((v) => ({ name: v.trim() }));
  }

  // Calculate total price (sum all vaccine.price if present and numeric)
  const totalPrice = vaccines.reduce((sum, v) => {
    const price = typeof v.price === "number" ? v.price : parseFloat(v.price);
    return !isNaN(price) ? sum + price : sum;
  }, 0);

  // Prepare appointment object for certificate template
  const appointmentForCertificate = {
    ...data,
    vaccines,
  };

  const handleDownload = async () => {
    const element = certificateRef.current;
    if (!element) return;

    const toastId = toast.loading('Generating Certificate...');
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 794,
        windowHeight: 1123,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Vaxis_Certificate_Appointment_${data.id}_${citizen.full_name || 'Citizen'}.pdf`);
      toast.success('Certificate downloaded', { id: toastId });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

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
          Full record for <strong>{citizen.full_name}</strong>
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
              <p className="font-medium">{citizen.full_name}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone</span>
              <p className="font-medium">{citizen.phone || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-500">Date of Birth</span>
              <p className="font-medium">{formatDate(citizen.dob)}</p>
            </div>
            <div>
              <span className="text-gray-500">Gender</span>
              <p className="font-medium">{citizen.gender || "N/A"}</p>
            </div>
            <div>
              <span className="text-gray-500">Blood Type</span>
              <p className="font-medium">{citizen.blood_type || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Address
              </span>
              <p className="font-medium">{citizen.address || "N/A"}</p>
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
            {vaccines.length > 0 && (
              <div>
                <span className="font-bold text-gray-600">Vaccines</span>
                <div className="flex flex-col gap-2 mt-2">
                  {vaccines.map((v, idx) => (
                    <div key={idx} className="bg-white border border-teal-100 rounded-lg p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Syringe className="w-3 h-3" />
                        <span className="font-semibold text-teal-700">{v.name}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(v).map(([key, value]) =>
                          key !== "name" && key !== "id" && key !== "price" && (
                            <div key={key} className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                              <span className="font-semibold text-gray-900">{value || "N/A"}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {totalPrice > 0 && (
                  <div className="flex items-center gap-2 mt-2 text-teal-700 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    Total Price: {totalPrice.toLocaleString()} VND
                  </div>
                )}
              </div>
            )}

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
            <div>
              <p className="text-gray-600 font-bold">Administered by</p>
              <p className="font-bold text-gray-500">{data.administered_by}</p>
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
            onClick={handleDownload}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Certificate
          </button>
        </div>

        {/* Hidden Certificate Template for PDF Generation */}
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <VaccinationCertificateTemplate
            ref={certificateRef}
            userProfile={citizen}
            appointment={appointmentForCertificate}
          />
        </div>
      </div>
    </div>
  );
};

export default VaccinationDetails;
