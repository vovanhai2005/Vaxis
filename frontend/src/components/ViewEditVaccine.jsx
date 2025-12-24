import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Save, Pencil, Undo2, Image as ImageIcon } from 'lucide-react';
import { useVaccineStore } from '../store/useVaccineStore';

const ViewEditVaccine = ({ isOpen, onClose, vaccineData }) => {
  const { editVaccine, isLoadingVaccines } = useVaccineStore();
  const [isEditing, setIsEditing] = useState(false);
  
  // State mới: Dùng để disable nút Save NGAY LẬP TỨC khi vừa bấm
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State form data
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    manufacturer: '',
    description: '',
    price: '',
    imageUrl: '', 
    created_at: ''
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [savedData, setSavedData] = useState(null);

  useEffect(() => {
    if (vaccineData) {
      const initialData = {
        code: vaccineData.code || '',
        name: vaccineData.name || '',
        manufacturer: vaccineData.manufacturer || '',
        description: vaccineData.description || '',
        price: vaccineData.price || 0,
        imageUrl: vaccineData.image_url || '',
        created_at: vaccineData.created_at 
            ? new Date(vaccineData.created_at).toLocaleDateString('en-US') 
            : ''
      };
      
      setFormData(initialData);
      setSavedData(initialData); 
      setPreviewImage(vaccineData.image_url || null);
    }
    setIsEditing(false);
  }, [vaccineData, isOpen]);

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleToggleEdit = (e) => {
    if (e) e.preventDefault();

    if (isEditing) {
      // Nếu đang Edit mà nhấn Cancel -> Revert về savedData
      setFormData({ ...savedData });
      setPreviewImage(savedData.imageUrl || null);
    }
    // Nếu đang View mà nhấn Edit -> Giữ nguyên
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setPreviewImage(null);      
      setFormData((prev) => ({ ...prev, imageUrl: '' })); 
  };

  const handleRestoreImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Lưu ý: Logic restore này lấy từ savedData (mốc chuẩn) thay vì vaccineData cũ
    if (savedData && savedData.imageUrl) {
      setPreviewImage(savedData.imageUrl);
      setFormData(prev => ({ ...prev, imageUrl: savedData.imageUrl }));
    }
  };

  // --- LOGIC HAS CHANGES (Đã sửa dependencies & logic so sánh ảnh) ---
  const hasChanges = useMemo(() => {
    if (!savedData) return false;

    const currentPrice = formData.price ? parseFloat(formData.price) : 0;
    const originalPrice = savedData.price ? parseFloat(savedData.price) : 0;
    
    const isCodeChanged = formData.code !== (savedData.code || '');
    const isNameChanged = formData.name !== (savedData.name || '');
    const isManufacturerChanged = formData.manufacturer !== (savedData.manufacturer || '');
    const isDescriptionChanged = formData.description !== (savedData.description || '');
    const isPriceChanged = currentPrice !== originalPrice;
    
    const originalImage = savedData.imageUrl || '';
    const currentImage = formData.imageUrl || '';
    const isImageChanged = currentImage !== originalImage;

    return isCodeChanged || isNameChanged || isManufacturerChanged || isDescriptionChanged || isPriceChanged || isImageChanged;
  }, [formData, savedData]); // Dependency là savedData

  // --- LOGIC SUBMIT (Đã thêm isSubmitting) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Khóa nút ngay lập tức
    setIsSubmitting(true); 

    const payload = {
        code: formData.code,
        name: formData.name,
        manufacturer: formData.manufacturer,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        imageUrl: formData.imageUrl
    };

    try {
        if (vaccineData.id) {
            await editVaccine(vaccineData.id, payload);
            
            // 2. Lưu thành công -> Cập nhật mốc chuẩn mới
            setSavedData({ ...formData });
            
            // 3. Chuyển ngay sang chế độ View (lúc này formData đã mới, UI sẽ hiện cái mới)
            setIsEditing(false);
        }
    } catch (error) {
        console.error("Failed to update vaccine", error);
        // Nếu lỗi thì giữ nguyên ở chế độ Edit để user sửa lại
    } finally {
        // 4. Mở khóa trạng thái submit (để lần sau dùng tiếp)
        setIsSubmitting(false);
    }
  };

  if (!isOpen || !vaccineData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-gray-100">
          
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center border-b border-gray-100">
            <div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    {isEditing ? 'Edit Vaccine Details' : 'Vaccine Information'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                   Created: {formData.created_at}
                </p>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 pt-3 pb-3">
              <div className="flex flex-col md:flex-row gap-6 mb-6 md:items-center">
                
                {/* --- CỘT TRÁI: ẢNH --- */}
                <div className="w-full md:w-1/3 flex flex-col">
                    <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Vaccine Image</label>
                    <div className="relative w-full h-64">
                        {!isEditing ? (
                            <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-fill"/>
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="mx-auto h-10 w-10 text-gray-300" />
                                        <p className="mt-2 text-xs text-gray-400">No image available</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <label className="group relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-teal-400 transition-all cursor-pointer bg-gray-50 overflow-hidden">
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                {previewImage ? (
                                    <div className="absolute inset-0 w-full h-full z-20 bg-white">
                                        <img src={previewImage} alt="Preview" className="w-full h-full block object-fill" />
                                        <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 hover:bg-red-50 shadow-sm border border-gray-200 transition-all z-30">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center p-4 z-10">
                                        <ImageIcon className="mx-auto h-10 w-10 text-gray-400 group-hover:text-teal-500 transition-colors" />
                                        <p className="mt-2 text-sm font-semibold text-gray-600 group-hover:text-teal-600">Click to upload</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF</p>
                                        
                                        {/* Nút Restore sử dụng logic mới */}
                                        {savedData && savedData.imageUrl && (
                                            <button type="button" onClick={handleRestoreImage} className="mt-3 px-3 py-1 text-xs font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-full border border-teal-200 transition-colors z-30">
                                                <Undo2 className="w-3 h-3 inline-block mr-1" /> Restore Original
                                            </button>
                                        )}
                                    </div>
                                )}
                            </label>
                        )}
                    </div>
                </div>

                {/* --- CỘT PHẢI: INPUTS --- */}
                <div className="w-full md:w-2/3">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                        {/* Các ô input giữ nguyên logic disable={!isEditing} */}
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Code</label>
                            <div className="mt-1">
                                <input type="text" name="code" disabled={!isEditing} value={formData.code} onChange={handleChange}
                                    className={`block w-full px-3 py-2.5 border outline-none rounded-xl sm:text-sm ${isEditing ? 'border-gray-300 focus:ring-teal-500 bg-white' : 'border-transparent bg-gray-100 text-gray-600 cursor-default'}`} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Price ($)</label>
                            <div className="mt-1">
                                <input type="text" name="price" disabled={!isEditing} value={formData.price} onChange={handleChange}
                                    className={`block w-full px-3 py-2.5 border outline-none rounded-xl sm:text-sm ${isEditing ? 'border-gray-300 focus:ring-teal-500 bg-white' : 'border-transparent bg-gray-100 text-teal-700 font-bold cursor-default'}`} />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium leading-6 text-gray-900">Vaccine Name</label>
                            <div className="mt-1">
                                <input type="text" name="name" disabled={!isEditing} value={formData.name} onChange={handleChange}
                                    className={`block w-full px-3 py-2.5 border outline-none rounded-xl sm:text-sm ${isEditing ? 'border-gray-300 focus:ring-teal-500 bg-white' : 'border-transparent bg-gray-100 text-gray-800 cursor-default'}`} />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium leading-6 text-gray-900">Manufacturer</label>
                            <div className="mt-1">
                                <input type="text" name="manufacturer" disabled={!isEditing} value={formData.manufacturer} onChange={handleChange}
                                    className={`block w-full px-3 py-2.5 border outline-none rounded-xl sm:text-sm ${isEditing ? 'border-gray-300 focus:ring-teal-500 bg-white' : 'border-transparent bg-gray-100 text-gray-800 cursor-default'}`} />
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Description</label>
                  <div className="mt-1">
                      <textarea name="description" rows={4} disabled={!isEditing} value={formData.description} onChange={handleChange}
                          className={`block w-full px-3 py-2.5 border outline-none rounded-xl sm:text-sm resize-none ${isEditing ? 'border-gray-300 focus:ring-teal-500 bg-white' : 'border-transparent bg-gray-100 text-gray-600 cursor-default'}`} />
                  </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100 rounded-b-2xl gap-2">
              {isEditing ? (
                <>
                    <button
                        type="submit"
                        disabled={isSubmitting || isLoadingVaccines || !hasChanges}
						className={`flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white shadow-sm transition-all
								${(!hasChanges && !isSubmitting && !isLoadingVaccines)
									? 'bg-gray-400 cursor-not-allowed opacity-70' 
									: 'bg-teal-600 hover:bg-teal-700'          
								}
								${(isSubmitting || isLoadingVaccines) ? 'cursor-wait opacity-90' : ''} // (Tùy chọn) Thêm cursor quay vòng khi đang lưu
							`}
						>
							{(isSubmitting || isLoadingVaccines) ? (
								<Loader2 className="w-4 h-4 animate-spin mr-2" />
							) : (
								<Save className="w-4 h-4 mr-2" />
							)}
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleEdit}
                        disabled={isSubmitting} // Khóa nút Cancel luôn khi đang lưu
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
                        Edit Vaccine
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

export default ViewEditVaccine;