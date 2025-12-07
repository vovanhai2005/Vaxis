import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, PackagePlus, Calendar, ChevronDown, Check } from 'lucide-react';
import { useVaccineLotStore } from '../store/useVaccineLotStore';
import { useVaccineStore } from '../store/useVaccineStore'; // Giả định bạn có store này để lấy list vaccine

const AddVaccineLot = ({ isOpen, onClose, onSuccess }) => {

  const [showVaccineDropdown, setShowVaccineDropdown] = useState(false);
  const { addLot } = useVaccineLotStore();
  // Lấy danh sách vaccine để hiển thị trong dropdown
  const { vaccines, getVaccines } = useVaccineStore(); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialForm = {
    vaccine_id: '',
    lot_number: '',
    quantity: '',
    expiry_date: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialForm);

  // Load danh sách vaccine khi mở modal
  useEffect(() => {
    if (isOpen) {     
      if (getVaccines) getVaccines(); 
    }
  }, [isOpen, getVaccines]);

  const handleClose = () => {
    setFormData(initialForm);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Xử lý riêng cho quantity để chỉ nhận số
    if (name === 'quantity') {
       // Chỉ cho phép nhập số nguyên dương
      if (value === '' || /^\d+$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Chuẩn bị dữ liệu gửi lên server
      const submitData = {
        vaccine_id: parseInt(formData.vaccine_id),
        lot_number: formData.lot_number,
        quantity: parseInt(formData.quantity) || 0,
        expiry_date: formData.expiry_date,
        notes: formData.notes
      };

      await addLot(submitData);
	  if (onSuccess) {
          onSuccess(); 
      }
      handleClose();
    } catch (error) {
      console.error("Failed to add lot", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-100">
          
          {/* Header */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 rounded-lg">
                    <PackagePlus className="h-5 w-5 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Import Vaccine Lot
                </h3>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6 space-y-6">
              
              {/* Row 1: Chọn Vaccine & Số Lô */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Vaccine Selection */}
            {/* Custom Vaccine Selection Dropdown */}
<div className="relative">
  <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">
    Select Vaccine <span className="text-red-500">*</span>
  </label>
  
  {/* Nút bấm mô phỏng thẻ Select */}
  <button
    type="button"
    onClick={() => setShowVaccineDropdown(!showVaccineDropdown)}
    className="relative w-full cursor-default rounded-xl bg-white py-2.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:text-sm sm:leading-6 border border-gray-200"
  >
    <span className="block truncate">
      {formData.vaccine_id 
        ? vaccines.find(v => v.id == formData.vaccine_id)?.name || 'Unknown Vaccine'
        : '-- Select a vaccine --'}
    </span>
    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
      <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
    </span>
  </button>

  {showVaccineDropdown && (
    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
      {vaccines && vaccines.map((vac) => (
        <div
          key={vac.id}
          className={`relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-teal-50 ${
            formData.vaccine_id == vac.id ? 'text-teal-900 bg-teal-50 font-semibold' : 'text-gray-900'
          }`}
          onClick={() => {
            handleChange({ target: { name: 'vaccine_id', value: vac.id } });
            setShowVaccineDropdown(false);
          }}
        >
          <span className="block truncate">
            {vac.name} ({vac.code})
          </span>
          
          {/* Dấu tích nếu đang chọn */}
          {formData.vaccine_id == vac.id && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-teal-600">
              <Check className="h-4 w-4" />
            </span>
          )}
        </div>
      ))}
      
      {(!vaccines || vaccines.length === 0) && (
        <div className="py-2 pl-3 text-gray-500 italic">No vaccines available</div>
      )}
    </div>
  )}
</div>

                {/* Lot Number */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Lot Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="lot_number"
                      required
                      value={formData.lot_number}
                      onChange={handleChange}
                      className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-900"
                      placeholder="e.g. L-2025-001"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Số lượng & Hạn sử dụng */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Quantity<span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="quantity"
                      required
                      value={formData.quantity}
                      onChange={handleChange}
                      className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-900"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="date"
                      name="expiry_date"
                      required
					  style={{ colorScheme: 'light' }}
                      value={formData.expiry_date}
                      onChange={handleChange}
                      className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Ghi chú */}
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white text-gray-900"
                    placeholder="Additional information about this batch..."
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100 rounded-b-2xl">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-lg shadow-teal-900/20 transition-all hover:scale-105 ml-3 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving...</>
                ) : (
                  <><Save className="w-5 h-5 mr-2" /> Import Lot</>
                )}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVaccineLot;