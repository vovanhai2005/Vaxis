import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Pencil, Undo2, Image as ImageIcon } from 'lucide-react';
import { useVaccineStore } from '../store/useVaccineStore';

const ViewEditVaccine = ({ isOpen, onClose, vaccineData }) => {
  const { editVaccine, isLoadingVaccines } = useVaccineStore();
  const [isEditing, setIsEditing] = useState(false);
  
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

  // State riêng cho preview ảnh
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (vaccineData) {
      setFormData({
        code: vaccineData.code || '',
        name: vaccineData.name || '',
        manufacturer: vaccineData.manufacturer || '',
        description: vaccineData.description || '',
        price: vaccineData.price || 0,
        imageUrl: vaccineData.image_url || '',
        created_at: vaccineData.created_at 
            ? new Date(vaccineData.created_at).toLocaleDateString('en-US') 
            : ''
      });
      // Set ảnh ban đầu từ DB
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
      // Revert data nếu Cancel
      setFormData({
        code: vaccineData.code || '',
        name: vaccineData.name || '',
        manufacturer: vaccineData.manufacturer || '',
        description: vaccineData.description || '',
        price: vaccineData.price || 0,
        imageUrl: vaccineData.image_url || '',
        created_at: vaccineData.created_at 
            ? new Date(vaccineData.created_at).toLocaleDateString('en-US') 
            : ''
      });
      setPreviewImage(vaccineData.image_url || null);
    }
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

  // Logic upload ảnh (Giống AddVaccine)
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

  // Logic xóa ảnh preview (Giống AddVaccine)
  const handleRemoveImage = (e) => {
      e.preventDefault();
      e.stopPropagation(); // Ngăn chặn click lan truyền vào label upload
      setPreviewImage(null);
      // Khi xóa ảnh, ta set imageUrl rỗng. 
      // Lưu ý: Controller hiện tại đang dùng COALESCE nên nếu gửi null/rỗng nó sẽ giữ ảnh cũ.
      // Nếu muốn xóa ảnh trong DB cần update controller thêm logic, nhưng về mặt UI thì sẽ biến mất.
      setFormData((prev) => ({ ...prev, imageUrl: '' })); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
        code: formData.code,
        name: formData.name,
        manufacturer: formData.manufacturer,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        imageUrl: formData.imageUrl
    };

    if (vaccineData.id) {
        await editVaccine(vaccineData.id, payload);
        setIsEditing(false);
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
          
          {/* Header */}
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
                    <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                        Vaccine Image
                    </label>
                    
                    {/* Container ảnh cố định chiều cao */}
                    <div className="relative w-full h-64">
                        
                        {/* CASE 1: CHẾ ĐỘ VIEW (CHỈ XEM) */}
                        {!isEditing ? (
                            <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                                {previewImage ? (
                                    <img 
                                        src={previewImage} 
                                        alt="Preview" 
                                        className="w-full h-full object-fill"
                                    />
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="mx-auto h-10 w-10 text-gray-300" />
                                        <p className="mt-2 text-xs text-gray-400">No image available</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                        /* CASE 2: CHẾ ĐỘ EDIT (GIỐNG ADD VACCINE) */
                            <label 
                                className="group relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-teal-400 transition-all cursor-pointer bg-gray-50 overflow-hidden"
                            >
                                {/* Input file ẩn */}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                
                                {previewImage ? (
                                    // a. Đã có ảnh (Hiện ảnh + Nút xóa)
                                    <div className="absolute inset-0 w-full h-full z-20 bg-white">
                                        <img 
                                            src={previewImage} 
                                            alt="Preview" 
                                            className="w-full h-full block object-fill" 
                                        />
                                        
                                        {/* Nút xóa ảnh */}
                                        <button 
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 hover:bg-red-50 shadow-sm border border-gray-200 transition-all z-30"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    // b. Chưa có ảnh (Hiện UI upload)
                                    <div className="text-center p-4 z-10">
                                        <ImageIcon className="mx-auto h-10 w-10 text-gray-400 group-hover:text-teal-500 transition-colors" />
                                        <p className="mt-2 text-sm font-semibold text-gray-600 group-hover:text-teal-600">
                                            Click to upload
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF</p>
                                    </div>
                                )}
                            </label>
                        )}
                    </div>
                </div>

                {/* --- CỘT PHẢI: INPUTS --- */}
                <div className="w-full md:w-2/3">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                        {/* Code */}
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Code</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="code"
                                    disabled={!isEditing}
                                    value={formData.code}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                                    ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white' : 'border-transparent bg-gray-100 text-gray-600 cursor-default'}`}
                                />
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Price ($)</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="price"
                                    disabled={!isEditing}
                                    value={formData.price}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                                    ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white' : 'border-transparent bg-gray-100 text-teal-700 font-bold cursor-default'}`}
                                />
                            </div>
                        </div>

                        {/* Name (Full row) */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium leading-6 text-gray-900">Vaccine Name</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    disabled={!isEditing}
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                                    ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white' : 'border-transparent bg-gray-100 text-gray-800 cursor-default'}`}
                                />
                            </div>
                        </div>

                        {/* Manufacturer (Full row) */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium leading-6 text-gray-900">Manufacturer</label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="manufacturer"
                                    disabled={!isEditing}
                                    value={formData.manufacturer}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                                    ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white' : 'border-transparent bg-gray-100 text-gray-800 cursor-default'}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
              </div>

              {/* PHẦN 2: DESCRIPTION (FULL WIDTH) */}
              <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Description</label>
                  <div className="mt-1">
                      <textarea
                          name="description"
                          rows={4}
                          disabled={!isEditing}
                          value={formData.description}
                          onChange={handleChange}
                          className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm resize-none
                          ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white' : 'border-transparent bg-gray-100 text-gray-600 cursor-default'}`}
                      />
                  </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100 rounded-b-2xl gap-2">
              {isEditing ? (
                <>
                    <button
                        type="submit"
                        disabled={isLoadingVaccines}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
                    >
                        {isLoadingVaccines ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleEdit}
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
