import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Save, Pencil, Undo2, Calendar, Package, ClipboardList, AlertCircle } from 'lucide-react';
import { useVaccineLotStore } from '../store/useVaccineLotStore';

const ViewEditVaccineLot = ({ isOpen, onClose, lotData, onSuccess }) => {
  const { editLot, getLotById, isLoadingLots } = useVaccineLotStore();
  const [isEditing, setIsEditing] = useState(false);
  
  // State chặn spam click & Lưu mốc chuẩn
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedData, setSavedData] = useState(null);

  // [ADD] State loading cục bộ để tránh hiện dữ liệu cũ khi chuyển tab
  const [isInitializing, setIsInitializing] = useState(true);

  // State form data cho Lot (Batch)
  const [formData, setFormData] = useState({
    lot_number: '',
    quantity: '',
    expiry_date: '',
    notes: ''
  });

  // State hiển thị thông tin Vaccine cha
  const [vaccineInfo, setVaccineInfo] = useState({
    name: '',
    code: '',
    manufacturer: '',
    imageUrl: ''
  });

  useEffect(() => {
    const fetchLatestData = async () => {
      if (isOpen && lotData?.id) {
        // [ADD] Bắt đầu load dữ liệu mới -> Bật màn hình chờ ngay lập tức
        setIsInitializing(true);

        // Giả lập delay cực nhỏ để đảm bảo UI kịp render trạng thái loading (optional)
        // await new Promise(r => setTimeout(r, 0));

        const freshData = await getLotById(lotData.id);
        const data = freshData || lotData;

        const expiry = data.expiry_date 
            ? new Date(data.expiry_date).toISOString().split('T')[0] 
            : '';

        const initialData = {
            lot_number: data.lot_number || '',
            quantity: data.quantity || 0,
            expiry_date: expiry,
            notes: data.notes || ''
        };

        setFormData(initialData);
        setSavedData(initialData);

        setVaccineInfo({
            name: data.name || 'Unknown Vaccine',
            code: data.code || 'N/A',
            manufacturer: data.manufacturer || 'Unknown',
            imageUrl: data.image_url || ''
        });

        // [ADD] Load xong -> Tắt màn hình chờ
        setIsInitializing(false);
      }
    };

    fetchLatestData();
    setIsEditing(false);
  }, [isOpen, lotData?.id]); // Chạy lại khi ID thay đổi

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleToggleEdit = (e) => {
    if (e) e.preventDefault();
    if (isEditing) {
      if (savedData) {
          setFormData({ ...savedData });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'quantity') {
        if (value === '' || /^\d+$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const hasChanges = useMemo(() => {
    if (!savedData) return false;
    return (
        formData.lot_number !== savedData.lot_number ||
        parseInt(formData.quantity || 0) !== parseInt(savedData.quantity || 0) ||
        formData.expiry_date !== savedData.expiry_date ||
        formData.notes !== savedData.notes
    );
  }, [formData, savedData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
        lot_number: formData.lot_number,
        quantity: parseInt(formData.quantity) || 0,
        expiry_date: formData.expiry_date,
        notes: formData.notes
    };

    try {
        if (lotData.id) {
            const updatedPartialData = await editLot(lotData.id, payload);
            const fullUpdatedData = { ...lotData, ...updatedPartialData };
        
            if (onSuccess) onSuccess(fullUpdatedData);
          
            setSavedData({ ...formData });
            setIsEditing(false);
        }
    } catch (error) {
        console.error("Update lot failed", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isOpen || !lotData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-gray-100 min-h-[400px]">
          
          {/* [ADD] Loading Overlay: Che nội dung cũ khi đang load cái mới */}
          {isInitializing && (
             <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-3" />
                <p className="text-sm text-gray-400">Loading batch details...</p>
             </div>
          )}

          {/* Header */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center border-b border-gray-100">
            <div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900 flex items-center gap-2">
                    {isEditing ? 'Edit Batch Details' : 'Batch Information'}
                    {!isEditing && !isInitializing && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                            ${new Date(formData.expiry_date) < new Date() ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {new Date(formData.expiry_date) < new Date() ? 'Expired' : 'Active'}
                        </span>
                    )}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                   Last Updated: {new Date().toLocaleDateString()}
                </p>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 pt-2 pb-0">
              
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                
                {/* --- CỘT TRÁI: VACCINE INFO (READ ONLY) --- */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Vaccine Reference
                    </label>
                    
                    <div className="bg-teal-50 rounded-xl p-4 border border-teal-100 shadow-sm">
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-white mb-3 border border-gray-200">
                             {vaccineInfo.imageUrl ? (
                                <img src={vaccineInfo.imageUrl} alt="Vaccine" className="w-full h-full object-fill" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                             )}
                        </div>
                        
                        {/* [FIX] Truncate & Break All cho tên dài */}
                        <h4 
                            className="font-bold text-gray-900 text-sm line-clamp-2 break-all" 
                            title={vaccineInfo.name}
                        >
                            {vaccineInfo.name}
                        </h4>

                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500 truncate" title={vaccineInfo.code}>
                                Code: <span className="font-mono text-teal-700 font-medium">{vaccineInfo.code}</span>
                            </p>
                            <p className="text-xs text-gray-500 truncate" title={vaccineInfo.manufacturer}>
                                Mfg: {vaccineInfo.manufacturer}
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg flex gap-2 items-start border border-gray-100">
                        <AlertCircle size={14} className="mt-0.5 text-gray-400 min-w-[14px]" />
                        <p>This information belongs to the vaccine definition and cannot be edited here.</p>
                    </div>
                </div>

                {/* --- CỘT PHẢI: LOT INFO (EDITABLE) --- */}
                <div className="w-full md:w-2/3">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                        Batch Details
                    </label>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                        {/* Lot Number */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium leading-6 text-gray-900">Lot Number / Batch ID</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <ClipboardList className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    name="lot_number"
                                    disabled={!isEditing}
                                    value={formData.lot_number}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                                    ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900' : 'border-transparent bg-gray-100 text-gray-800 cursor-default'}`}
                                />
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Quantity</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Package className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    name="quantity"
                                    disabled={!isEditing}
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                                    ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900' : 'border-transparent bg-gray-100 text-teal-700 font-bold cursor-default'}`}
                                />
                            </div>
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Expiry Date</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="date"
                                    name="expiry_date"
                                    disabled={!isEditing}
                                    style={{ colorScheme: 'light' }}
                                    value={formData.expiry_date}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                                    ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900' : 'border-transparent bg-gray-100 text-gray-900 cursor-default dark:text-gray-900'}`}
                                />
                            </div>
                        </div>

                        {/* Notes (Full width) */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium leading-6 text-gray-900">Notes</label>
                            <div className="mt-1">
                                <textarea
                                    name="notes"
                                    rows={8}
                                    disabled={!isEditing}
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Enter specific notes for this batch..."
                                    className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm resize-none
                                    ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900' : 'border-transparent bg-gray-100 text-gray-600 cursor-default'}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100 rounded-b-2xl gap-2">
              {isEditing ? (
                <>
                    <button
                        type="submit"
                        disabled={isSubmitting || isLoadingLots || !hasChanges}
                        className={`flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white shadow-sm transition-all
                            ${(!hasChanges && !isSubmitting && !isLoadingLots)
                                ? 'bg-gray-400 cursor-not-allowed opacity-70' // Xám
                                : 'bg-teal-600 hover:bg-teal-700'            // Xanh
                            }`}
                    >
                        {(isSubmitting || isLoadingLots) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleEdit}
                        disabled={isSubmitting}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
                    >
                        <Undo2 className="w-4 h-4 mr-2" />
                        Cancel
                    </button>
                </>
              ) : (
                <>
                    <button
                        type="button"
                        onClick={handleToggleEdit}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
                    >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Lot
                    </button>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="mt-3 sm:mt-0 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
                    >
                        Close
                    </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ViewEditVaccineLot;