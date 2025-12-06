import React, { useState } from 'react';
import { X, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { useVaccineStore } from '../store/useVaccineStore';

const AddVaccine = ({ isOpen, onClose }) => {
  const { addVaccine, isAddingVaccine } = useVaccineStore();
  
  const initialForm = {
    code: '',
    name: '',
    manufacturer: '',
    description: '',
    price: '',
    imageUrl: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [previewImage, setPreviewImage] = useState(null);

  const handleClose = () => {
    setFormData(initialForm);
    setPreviewImage(null);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return; 
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0
    };
    await addVaccine(submitData);
    handleClose();
  };

  if (!isOpen) return null;

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
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              Add New Vaccine
            </h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6">
              
              {/* PHẦN 1: ẢNH + THÔNG TIN CƠ BẢN */}
              <div className="flex flex-col md:flex-row gap-6 mb-6 md:items-center">
                
                {/* --- CỘT TRÁI: ẢNH --- */}
                <div className="w-full md:w-1/3 flex flex-col">
                  <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                    Vaccine Image
                  </label>
                  
                  {/* Wrapper cố định chiều cao h-64 để khung ảnh đẹp nhất */}
                  <div className="relative w-full h-64"> 
                    <label 
                      className="group relative flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-teal-400 transition-all cursor-pointer bg-gray-50 overflow-hidden"
                    >
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      
                      {previewImage ? (
                        // --- TRƯỜNG HỢP 1: ĐÃ CÓ ẢNH ---
                        // absolute inset-0: Ép khung ảnh dính chặt 4 góc, đè lên trên flexbox của label
                        <div className="absolute inset-0 w-full h-full z-20 bg-white">
                            <img 
                                src={previewImage} 
                                alt="Preview" 
                                // object-cover: Ảnh dãn đầy khung, cắt bớt phần thừa để không méo
                                className="w-full h-full block object-fill" 
                            />
                            
                            {/* Nút xóa ảnh */}
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setPreviewImage(null);
                                setFormData(prev => ({...prev, imageUrl: ''}));
                              }}
                              className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-1.5 hover:bg-red-50 shadow-sm border border-gray-200 transition-all z-30"
                            >
                              <X size={16} />
                            </button>
                        </div>
                      ) : (
                        // --- TRƯỜNG HỢP 2: CHƯA CÓ ẢNH ---
                        <div className="text-center p-4 z-10">
                          <ImageIcon className="mx-auto h-10 w-10 text-gray-400 group-hover:text-teal-500 transition-colors" />
                          <p className="mt-2 text-sm font-semibold text-gray-600 group-hover:text-teal-600">
                            Click to upload
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* --- CỘT PHẢI: INPUTS CƠ BẢN --- */}
                <div className="w-full md:w-2/3">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    {/* Code */}
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Code <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="code"
                          required
                          value={formData.code}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900"          
                          placeholder="VAC-001"
                        />
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Price (USD)
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900"          
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Vaccine Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Vaccine Name <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
						  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900"          
                          placeholder="Influenza Vaccine..."
                        />
                      </div>
                    </div>

                    {/* Manufacturer */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Manufacturer
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="manufacturer"
                          value={formData.manufacturer}
                          onChange={handleChange}
                        	className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900"          
                          placeholder="e.g. Pfizer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PHẦN 2: DESCRIPTION (FULL WIDTH) */}
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                  	className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900"          
                    placeholder="Details about the vaccine..."
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100 rounded-b-2xl">
              <button
                type="submit"
                disabled={isAddingVaccine}
                className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg shadow-gray-900/20 transition-all hover:scale-105"
              >
                {isAddingVaccine ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                ) : (
                  <><Save className="w-5 h-5 mr-2" /> Save Vaccine</>
                )}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto mr-3"
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

export default AddVaccine;