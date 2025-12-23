import React, { useState, useEffect, useMemo } from 'react'; // 1. Thêm useMemo
import { X, Loader2, Save, Pencil, Undo2 } from 'lucide-react';
import { useStaffStore } from '../store/useStaffStore';

const ViewEditStaff = ({ isOpen, onClose, staffData }) => {
  const { updateEmployeeProfile, isLoadingStaff } = useStaffStore();
  const [isEditing, setIsEditing] = useState(false);
  
  // 2. State chặn spam click & State lưu mốc chuẩn
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedData, setSavedData] = useState(null);

  const JOB_TITLE_PREFIXES = {
    "Doctor": "DOC",
    "Medical Assistant": "MA",
    "Nurse": "NUR",
    "Pharmacist": "PHA",
    "Receptionist": "REC",
    "Cashier": "CAS",
    "Screening Staff": "SCR",
    "Vaccination Staff": "VS",
    "Post-vaccination Monitoring Staff": "PMS",
    "Emergency / Adverse Reaction Staff": "EAR",
    "Laboratory Technician": "LAB",
    "Customer Service": "CS"
  };
  
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

  // 3. Cập nhật useEffect: Khởi tạo cả formData và savedData
  useEffect(() => {
    if (staffData) {
      const initialData = {
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
      };

      setFormData(initialData);
      setSavedData(initialData); // Lưu mốc chuẩn
    }
    // Luôn reset về chế độ xem (View Mode) khi mới mở modal
    setIsEditing(false); 
  }, [staffData, isOpen]);

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  // 4. Cập nhật logic Toggle: Revert về savedData khi Cancel
  const handleToggleEdit = (e) => {
    if (e) e.preventDefault(); 

    if (isEditing) {
      // Revert data về mốc chuẩn (savedData)
      setFormData({ ...savedData });
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
	if (name === 'role_title') {
        const prefix = JOB_TITLE_PREFIXES[value] || 'EMP';
        
        // Logic hiển thị preview ID (giữ nguyên logic cũ của bạn)
        // Lưu ý: savedData ở đây dùng để check xem role có trùng gốc không
        const isOriginalTitle = savedData && value === savedData.role_title;

        const displayId = isOriginalTitle ? savedData.employee_number : `${prefix}-xxx`;

        setFormData(prev => ({
            ...prev,
            role_title: value,
            employee_number: displayId 
        }));
        return;
    }	
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 5. Logic tính toán thay đổi (hasChanges)
  const hasChanges = useMemo(() => {
    if (!savedData) return false;

    return (
        formData.full_name !== savedData.full_name ||
        formData.email !== savedData.email ||
        formData.phone !== savedData.phone ||
        formData.national_id !== savedData.national_id ||
        formData.role_title !== savedData.role_title ||
        formData.dob !== savedData.dob
    );
  }, [formData, savedData]);

  // 6. Cập nhật handleSubmit: Xử lý khóa nút và cập nhật mốc chuẩn mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Khóa nút ngay lập tức
    setIsSubmitting(true);

    const payload = {
        fullname: formData.full_name,
        nationalId: formData.national_id,
        email: formData.email,
        phoneNumber: formData.phone,
        roleTitle: formData.role_title, 
        dob: formData.dob 
    };
    
    try {
        if (staffData.user_id) {
            await updateEmployeeProfile(staffData.user_id, payload);
            
            // Lưu thành công -> Cập nhật mốc chuẩn mới = dữ liệu vừa nhập
            setSavedData({ ...formData });
            
            // Chuyển về chế độ View
            setIsEditing(false);
        } else {
            console.error("Error: User ID is missing in staffData", staffData);
        }
    } catch (error) {
        console.error("Update failed", error);
    } finally {
        // Mở khóa
        setIsSubmitting(false);
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
                   ID: {formData.employee_number ? formData.employee_number : "N/A"} | Last Updated: {formData.created_at}
                </p>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-4 pt-3 pb-3 sm:px-6">
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

                {/* --- CÁC TRƯỜNG CÓ THỂ SỬA --- */}

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
         
		 
				{/* Employee Number*/}
					 <div>
						<label className="block text-sm font-medium leading-6 text-gray-500">Staff ID</label>
						<div className="mt-1">
						 <input
                        type="text"
                        disabled
                        value={formData.employee_number || 'N/A'}
                        className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed"
                      />
						</div>
					  </div>				
		 
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Job Title</label>
                  <div className="mt-1">
					<select
                        name="role_title"
                        disabled={!isEditing} 
                        value={formData.role_title}
                        onChange={handleChange} 
                        className={`block w-full px-3 py-2.5 border outline-none rounded-xl leading-5 transition duration-150 ease-in-out sm:text-sm 
                          ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white' : 'border-transparent bg-gray-50 text-gray-800 disabled:opacity-100'}`}
                      >
                        <option value="">Select a Job Title</option>
                        {Object.keys(JOB_TITLE_PREFIXES).map((title) => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                  </div>
                </div>
         
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
         
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-100 rounded-b-2xl gap-2">
              {isEditing ? (
                <>
                    {/* 7. Nút Save: Thêm logic disable và đổi màu */}
                    <button
                        type="submit"
                        disabled={isSubmitting || isLoadingStaff || !hasChanges}
                        className={`flex items-center justify-center px-4 py-2 border border-transparent rounded-xl text-sm font-medium text-white shadow-sm transition-all
                            ${(!hasChanges && !isSubmitting && !isLoadingStaff)
                                ? 'bg-gray-400 cursor-not-allowed opacity-70' // Xám khi không có thay đổi & không đang lưu
                                : 'bg-teal-600 hover:bg-teal-700'            // Xanh khi có thay đổi hoặc đang lưu
                            }`}
                    >
                        {(isSubmitting || isLoadingStaff) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </button>
                    
                    {/* Nút Cancel: Disable khi đang submit */}
                    <button
                        type="button"
                        onClick={handleToggleEdit}
                        disabled={isSubmitting}
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