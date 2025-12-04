import React, { useEffect, useState } from 'react';
import { useStaffStore } from '../../store/useStaffStore';
import Header from '../../components/Header';
import { Users,  Search,  Plus, Filter, Trash2,  ChevronLeft, ChevronRight,
 ChevronsLeft, ChevronsRight,  Eye, RotateCcw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AddStaff from '../../components/AddStaff'; 
import ViewEditStaff from '../../components/ViewEditStaff';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

const EmployeeManagementPage = () => {
  const { staffList, isLoadingStaff, getStaffList, deleteEmployee, restoreEmployee } = useStaffStore();
  
  // Local state cho tìm kiếm và phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  //  State quản lý đóng mở Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  
  // STATE MỚI CHO FILTER
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Đóng mở menu filter
  const [filters, setFilters] = useState({
    role: '',           // '' (All), 'manager', 'employee'
    status: '',         // '' (All), 'active', 'inactive'
    hasNationalId: '',  // '' (All), 'yes', 'no'
    hasStaffId: '',     // '' (All), 'yes', 'no'
  });
  
  // Lấy dữ liệu khi component mount
  useEffect(() => {
    getStaffList();
  }, [getStaffList]);

// TỰ ĐỘNG RESET VỀ TRANG 1 KHI TÌM KIẾM HOẶC LỌC
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);
  
  // Xử lý tìm kiếm & Filter kết hợp
  const filteredStaff = staffList.filter((employee) => {
    // 1. Logic Search (Giữ nguyên logic cũ)
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      (employee.full_name || '').toLowerCase().includes(term) ||
      (employee.username || '').toLowerCase().includes(term) ||
      (employee.email || '').toLowerCase().includes(term) ||
      (employee.employee_number || '').toLowerCase().includes(term) ||
      (employee.national_id || '').toLowerCase().includes(term)
    );

    // 2. Logic Filter (MỚI)
    // - Filter Role
    const matchesRole = filters.role === '' || employee.role === filters.role;

    // - Filter Status (active là boolean)
    const matchesStatus = filters.status === '' 
        ? true 
        : filters.status === 'active' ? employee.active : !employee.active;

    // - Filter National ID (Kiểm tra có giá trị hay null/empty)
    const matchesNationalId = filters.hasNationalId === ''
        ? true
        : filters.hasNationalId === 'yes' ? !!employee.national_id : !employee.national_id;

    // - Filter Staff ID (Kiểm tra có giá trị hay null/empty)
    const matchesStaffId = filters.hasStaffId === ''
        ? true
        : filters.hasStaffId === 'yes' ? !!employee.employee_number : !employee.employee_number;

    // Kết hợp tất cả điều kiện (AND)
    return matchesSearch && matchesRole && matchesStatus && matchesNationalId && matchesStaffId;
  });

  // Xử lý phân trang
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Hàm khi bấm nút icon thùng rác ở bảng
  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee); 
    setIsDeleteOpen(true);     
  };

  // Hàm khi bấm nút "Yes, Delete" trong popup
  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      await deleteEmployee(employeeToDelete.id);
      setIsDeleteOpen(false);
      setEmployeeToDelete(null);
    }
  };

  // Helper render badge chức vụ
  const renderRole = (employee) => {
      // Nếu là Manager
      if (employee.role === 'manager') {
          return (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold border border-purple-200">
                Admin
            </span>
          );
      };
      
      // Nếu là Employee, hiển thị role_title (ví dụ: Y tá trưởng), nếu không có thì ghi Nhân viên
      return (
        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-100">
            {employee.role_title || 'N/A'}
        </span>
      );
  };
  
  // xem/sửa 
  const handleRowClick = (employee) => {
    setSelectedStaff(employee);
    setIsViewModalOpen(true);
};

  // HÀM XỬ LÝ UNDO
  const handleUndo = async (id) => {
      // Có thể thêm confirm nếu muốn, nhưng Undo thường nên nhanh gọn
      // if (window.confirm("Restore this employee?")) {
          await restoreEmployee(id);
      // }
  };
  
  // Hàm reset filter về mặc định
  const clearFilters = () => {
    setFilters({ role: '', status: '', hasNationalId: '', hasStaffId: '' });
    setIsFilterOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30 pb-10">
      <Header 
        title="Staff Management" 
        subtitle="List of employees"
        icon={Users}
        notificationCount={0} 
      />

      {/* Render Modal */}
      <AddStaff
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
      />
	  
	  <ViewEditStaff 
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          staffData={selectedStaff}
      />
	  
	  <DeleteConfirmationModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={employeeToDelete?.full_name} // Hiển thị tên người bị xóa
        isLoading={isLoadingStaff} // Hiển thị spinner nếu store đang chạy
      />

      <div className="px-6 mt-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
            
            {/* --- TOOLBAR SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out sm:text-sm"
                        placeholder="Search by staff number, name, email, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full md:w-auto relative"> 
                    {/* Bọc div relative để dropdown hiển thị đúng vị trí */}
                    
                    <div className="relative">
                        <button 
                            className={`flex items-center justify-center px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                                isFilterOpen || Object.values(filters).some(v => v !== '') 
                                ? 'bg-teal-50 border-teal-200 text-teal-700' // Highlight khi đang mở hoặc đang có filter
                                : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </button>

                        {/* MENU DROPDOWN FILTER */}
                        {isFilterOpen && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4">
                                <div className="space-y-4">
                                    {/* Header Dropdown */}
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="font-semibold text-gray-700">Filter Options</span>
                                        <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">
                                            Reset All
                                        </button>
                                    </div>

                                    {/* 1. Filter Role */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                                        <select 
                                            className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border"
                                            value={filters.role}
                                            onChange={(e) => setFilters({...filters, role: e.target.value})}
                                        >
                                            <option value="">All Roles</option>
                                            <option value="manager">Manager</option>
                                            <option value="employee">Employee</option>
                                        </select>
                                    </div>

                                    {/* 2. Filter Status */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                                        <select 
                                            className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border"
                                            value={filters.status}
                                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="active">Available (Active)</option>
                                            <option value="inactive">Unavailable (Inactive)</option>
                                        </select>
                                    </div>

                                    {/* 3. Filter National ID */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">National ID</label>
                                        <select 
                                            className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border"
                                            value={filters.hasNationalId}
                                            onChange={(e) => setFilters({...filters, hasNationalId: e.target.value})}
                                        >
                                            <option value="">All</option>
                                            <option value="yes">Has ID</option>
                                            <option value="no">N/A (Missing)</option>
                                        </select>
                                    </div>

                                    {/* 4. Filter Staff ID */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Staff ID</label>
                                        <select 
                                            className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border"
                                            value={filters.hasStaffId}
                                            onChange={(e) => setFilters({...filters, hasStaffId: e.target.value})}
                                        >
                                            <option value="">All</option>
                                            <option value="yes">Has Staff ID</option>
                                            <option value="no">N/A (Missing)</option>
                                        </select>
                                    </div>
                                    
                                    {/* Nút đóng */}
                                    <button 
                                        onClick={() => setIsFilterOpen(false)}
                                        className="w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-700 transition-colors mt-2"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <button 
                        className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg shadow-gray-900/20 transition-all hover:scale-105"
                        onClick={() =>  setIsAddOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                    </button>
                </div>
            </div>

            {/* --- TABLE SECTION --- */}
            <div className="overflow-x-auto flex-grow">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                No
                            </th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100">
                                Staff ID
                            </th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100">
                                Full name
                            </th>
                            { /* <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100">
                                Ngày sinh
                            </th> */}
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100">
                                Email
                            </th>
                            { /* <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100">
                                Email
                            </th> */}
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100">
                                National ID
                            </th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100">
                                Job Title 
                            </th>
							 <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100">
                                Status
                            </th>
                            <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100">
                                Operation
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoadingStaff ? (
                            <tr>
                               <td colSpan="9" className="px-6 py-20 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" /> 
                                    <span className="text-sm font-medium">Loading data...</span>
                                </div>
                                </td>
                            </tr>
                        ) : currentItems.length > 0 ? (
                            currentItems.map((employee, index) => (
                                <tr key={employee.user_id} className="hover:bg-gray-50 transition-colors">
                                     {/* sst*/}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium">
                                        {String(index + 1 + indexOfFirstItem).padStart(3, '0')}
                                    </td>
                                    
                                    {/* employee_number*/}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium">
                                        {employee.employee_number || 'N/A'}
                                    </td>
                                    
                                    {/* Họ tên */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium">
                                        {employee.full_name || employee.username}
                                    </td>

                                    {/* Email */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100">
                                        {employee.email || 'N/A'}
                                    </td>
                                    
                                    {/* CCCD */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100">
                                        {employee.national_id || 'N/A'}
                                    </td>

                                    {/* Chức vụ */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm border-l border-gray-100">
                                        {renderRole(employee)}
                                    </td>
									
									  {/* trạng thái*/}
                                     <td className="px-4 py-4 whitespace-nowrap text-sm border-l border-gray-100">
										{employee.active ? (
											<span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold border border-green-200">
												available
											</span>
										) : (
											<span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold border border-red-200">
												unavailable
											</span>
										)}
									</td>
									
                              <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium border-l border-gray-100">
									  <div className="flex items-center justify-center gap-2">
										
										{/* 1. Nút View/Edit: Chỉ hiển thị nếu role là employee */}
										{employee.role === 'employee' && (
										  <button 
											className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded" 
											title="View/Edit"
											onClick={() => handleRowClick(employee)}
										  >
											<span className="hidden">View/Edit</span>
											<Eye size={18} />
										  </button>
										)}

										{/* 2. Logic Nút Delete / Undo */}
										{employee.active ? (
										  // Nếu Active = True: Chỉ hiện nút Delete nếu role là employee
										  employee.role === 'employee' && (
											<button 
											  className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded" 
											  title="Delete"
											  onClick={() => handleDeleteClick(employee)}
											>
											  <span className="hidden">Delete</span>
											  <Trash2 size={18} />
											</button>
										  )
										) : (
										  // Nếu Active = False: Hiện nút Undo
										  <button 
											className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded" 
											title="Undo"
											onClick={() => handleUndo(employee.id)}
										  >
											<span className="hidden">Undo</span>
											<RotateCcw size={18} />
										  </button>
										)}
										
									  </div>
									</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="px-6 py-10 text-center text-gray-500 italic">
                                   No staff found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PAGINATION SECTION --- */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-end pr-20 mt-auto">
                <div className="flex gap-1">
                    <button 
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronsLeft size={16} />
                    </button>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    {/* Render page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1)) 
                        .map(number => (
                        <button
                            key={number}
                            onClick={() => handlePageChange(number)}
                            className={`px-3 py-1 border rounded text-sm font-medium ${
                                currentPage === number 
                                ? 'bg-teal-700 text-white border-teal-700' 
                                : 'border-teal-300 hover:bg-teal-100 text-gray-700'
                            }`}
                        >
                            {number}
                        </button>
                    ))}

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button 
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>
        </div>
      </div>
      
       {/* Help Button */}
      <button className="fixed bottom-6 right-6 bg-gray-900 hover:bg-gray-800 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 group">
        <span className="text-xl font-medium">?</span>
        <span className="absolute right-full mr-3 bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Need help?
        </span>
      </button>
    </div>
  );
};

export default EmployeeManagementPage;