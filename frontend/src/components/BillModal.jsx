import React from 'react';
import { X, FileText, User, Calendar, DollarSign, CheckCircle, AlertCircle, Printer } from 'lucide-react';

const BillModal = ({ isOpen, onClose, billData, onPayment }) => {
  if (!isOpen || !billData) return null;

  const formatCurrency = (cents) => {
    return `${(cents / 100).toLocaleString('vi-VN')} VND`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600" size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Vaccination Bill</h3>
                <p className="text-sm text-gray-600 mt-1">Bill ID: #{billData.bill_id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Bill Content */}
        <div className="p-6 space-y-6">
          {/* Patient Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="text-blue-600" size={20} />
              Patient Information
            </h4>
            <div className="text-sm">
              <div className="flex justify-between py-2">
                <span className="text-gray-600 font-medium">Full Name:</span>
                <span className="text-gray-900 font-semibold">{billData.full_name}</span>
              </div>
            </div>
          </div>

          {/* Bill Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              Bill Details
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Issue Date:</span>
                <span className="text-gray-900">{formatDate(billData.bill_created_at)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Services:</span>
                <span className="text-gray-900">{billData.vaccine_names}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600 font-medium">Payment Status:</span>
                <span className={`flex items-center gap-1 font-semibold ${
                  billData.paid ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {billData.paid ? (
                    <>
                      <CheckCircle size={16} />
                      Paid
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} />
                      Unpaid
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-blue-600" size={24} />
                <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
              </div>
              <span className="text-3xl font-bold text-blue-600">
                {Number(billData.amount_cents).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Payment Notice */}
         {!billData.paid && (
  <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
    <h3 className="font-semibold text-gray-800 mb-3">Quét mã để thanh toán</h3>
    
    {/* Cấu trúc link VietQR: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT> */}
    <img 
      src={`https://img.vietqr.io/image/BIDV-8804279805-compact2.png?amount=${billData.amount_cents}&addInfo=${billData.vaccine_names} payment`}
      alt="Mã QR Thanh Toán"
      className="w-64 h-auto object-contain border rounded-lg"
    />
  </div>
)}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              <Printer size={20} />
              Print Bill
            </button>
            {!billData.paid ? (
              <button
                onClick={onPayment}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                <CheckCircle size={20} />
                Mark as Paid
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillModal;
