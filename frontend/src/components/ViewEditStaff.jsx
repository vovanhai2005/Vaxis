import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Pencil, Undo2 } from 'lucide-react';
import { useStaffStore } from '../store/useStaffStore';

const ViewEditStaff = ({ isOpen, onClose, staffData }) => {
  const { updateEmployeeProfile, isLoadingStaff } = useStaffStore();
  const [isEditing, setIsEditing] = useState(false);
  
  // State form data
  const [formData, setFormData] = useState({
      full_name: '',
      username: '',
      email: '',
      phone: '',
      national_id: '',
      employee_number: '',
      role_title: '',
      role: '', 
      dob: '',
      created_at: '',
      active: true
  });

  // Load data vào form khi mở modal
  useEffect(() => {
    if (staffData) {
      setFormData({
        full_name: staffData.full_name || '',
        username: staffData.username || '',
        email: staffData.email || '',
        phone: staffData.phone || '',
        national_id: staffData.national_id || '',
        employee_number: staffData.employee_number || '',
        role_title: staffData.role_title || '',
        role: staffData.role || '',
        dob: staffData.dob ? staffData.dob.split('T')[0] : '',
        created_at: staffData.created_at ? new Date(staffData.created_at).toLocaleDateString('us-US') : '',
        active: staffData.active
      });
    }
    // Luôn reset về chế độ xem (View Mode) khi mới mở modal
    setIsEditing(false); 
  }, [staffData, isOpen]);

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  // Nút chuyển đổi chế độ Edit <-> View
  const handleToggleEdit = (e) => {
    // Dòng quan trọng nhất: Chặn hành vi submit form
    if (e) e.preventDefault(); 

    if (isEditing) {
      // Logic cũ: Revert data nếu đang sửa mà hủy
      setFormData(prev => ({
        ...prev,
        full_name: staffData.full_name || '',
        email: staffData.email || '',
        phone: staffData.phone || '',
        national_id: staffData.national_id || '',
        role_title: staffData.role_title || '',
        dob: staffData.dob ? staffData.dob.split('T')[0] : '',
      }));
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'national_id' || name === 'phone') {
        if (value === '' || /^\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
        fullname: formData.full_name,
        nationalId: formData.national_id,
        email: formData.email,
        phoneNumber: formData.phone,
        roleTitle: formData.role_title, 
        dob: formData.dob 
    };
    
   if (staffData.user_id) {
        await updateEmployeeProfile(staffData.user_id, payload);
        setIsEditing(false);
    } else {
        console.error("Error: User ID is missing in staffData", staffData);
        // Có thể hiện thông báo lỗi cho user biết
    }
  };

  if (!isOpen || !staffData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-gray-100">
          
          {/* Header Modal */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center border-b border-gray-100">
            <div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                {isEditing ? 'Edit Employee Profile' : 'Employee Details'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                   ID: {formData.employee_number ? formData.employee_number : "N/A"} - {formData.created_at}
                </p>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-4 py-6 sm:px-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-500">Username</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      disabled
                      value={formData.username}
                      className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* System Role */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-500">System Role</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      disabled
                      value={formData.role ? formData.role.toUpperCase() : ''} 
                      className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* --- CÁC TRƯỜNG CÓ THỂ SỬA (disable={!isEditing}) --- */}

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium leading-6 text-gray-900">Full Name</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="full_name"
                      disabled={!isEditing} 
                      value={formData.full_name}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                        ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white' : 'border-transparent bg-gray-50 text-gray-800'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Email Address</label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      disabled={!isEditing}
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                        ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white' : 'border-transparent bg-gray-50 text-gray-800'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Phone Number</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="phone"
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                        ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white' : 'border-transparent bg-gray-50 text-gray-800'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">National ID (CCCD)</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="national_id"
                      disabled={!isEditing}
                      value={formData.national_id}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                        ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white' : 'border-transparent bg-gray-50 text-gray-800'}`}
                    />
                  </div>
                </div>

                {/* SỬA 1: Job Title - Đổi disabled={true} thành disabled={!isEditing} và thêm onChange */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Job Title</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="role_title"
                      disabled={!isEditing} 
                      value={formData.role_title}
                      onChange={handleChange} 
                      className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                        ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white' : 'border-transparent bg-gray-50 text-gray-800'}`}
                    />
                  </div>
                </div>

                {/* SỬA 2: Date of Birth - Đổi disabled={true} thành disabled={!isEditing} và thêm onChange */}
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Date of Birth</label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="dob"
                      disabled={!isEditing}
                      value={formData.dob}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                        ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white' : 'border-transparent bg-gray-50 text-gray-800'}`}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center mt-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${formData.active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'}`}>
                        {formData.active ? 'Active Employee' : 'Inactive / Resigned'}
                    </span>
                </div>

              </div>
            </div>

            {/* Footer buttons - Logic này đã đúng ý bạn: View hiện Edit, Edit hiện Save */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100 rounded-b-2xl gap-2">
              {isEditing ? (
                <>
                    <button
                        type="submit"
                        disabled={isLoadingStaff}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
                    >
                        {isLoadingStaff ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleEdit}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
                    >
                        <Undo2 className="w-4 h-4 mr-2" />
                        Cancel Edit
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
                        Edit Profile
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

export default ViewEditStaff;