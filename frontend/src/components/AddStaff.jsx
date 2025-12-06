import React, { useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { useStaffStore } from '../store/useStaffStore';

const AddStaff = ({ isOpen, onClose }) => {
  const { createEmployee, isLoadingStaff } = useStaffStore();
  
  // Initial state khớp với DB schema
  const initialForm = {
    full_name: '',
	username: '',
    password: '', // Cần thiết để tạo user
	email: '',
    phone: '',
    national_id: '', // Cho bảng employees
    role_title: '', // VD: Y tá, Bác sĩ...
    employee_number: '', // Mã nhân viên
    dob: '',
  };

  const [formData, setFormData] = useState(initialForm);

  // Reset form khi đóng modal
  const handleClose = () => {
    setFormData(initialForm);
    onClose();
  };

 const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'national_id' || name === 'phone') {
      if (value === '' || /^\d*$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      return; 
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    await createEmployee(formData);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal Panel */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-100">
          
          {/* Header */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center border-b border-gray-100">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              Add New Employee
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit}>
            <div className="px-4 py-6 sm:px-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                     	className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900"          
                      placeholder="Nguyen Van A"
                    />
                  </div>
                </div>
				{/* username */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                     	className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      	className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                     	className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="Text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
						className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900"      
						/>
                  </div>
                </div>

                {/* National ID (CCCD) */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    National ID (CCCD)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="national_id"
                      value={formData.national_id}
                      onChange={handleChange}
                      	className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm appearance-none bg-white text-gray-900"      
						/>
                  </div>
                </div>

                {/* Employee Number */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Staff ID
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="employee_number"
                      value={formData.employee_number}
                      onChange={handleChange}
                     	className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900"
                      placeholder="NV001"
                    />
                  </div>
                </div>

                {/* Role Title */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Job Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="role_title"
                      value={formData.role_title}
                      onChange={handleChange}
                     	className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900"   
                      placeholder="e.g. Head Nurse"
                    />
                  </div>
                </div>
                
                 {/* Date of Birth */}
                 <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Date of Birth
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                     	className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-900" 
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div 
			className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100 rounded-b-2xl">
              <button
                type="submit"
                disabled={isLoadingStaff}
                 className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg shadow-gray-900/20 transition-all hover:scale-105"
              >
                {isLoadingStaff ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                ) : (
                  <><Save 
				  className="w-5 h-5 mr-2"
				  /> Save Employee</>
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

export default AddStaff;