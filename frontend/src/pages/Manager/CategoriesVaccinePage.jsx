import React, { useEffect, useState } from 'react';
import { useVaccineStore } from '../../store/useVaccineStore';
import Header from '../../components/Header';
import AddVaccine from '../../components/AddVaccine';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'; 
import ViewEditVaccine from '../../components/ViewEditVaccine';

import { 
  Syringe, Search, Plus, Filter, Trash2, ChevronLeft, 
  ChevronRight, ChevronsLeft, ChevronsRight, Eye, 
  Loader2, Layers 
} from 'lucide-react';

const CategoriesVaccinePage = () => {
  // Lấy data và action từ store
  const { vaccines, isLoadingVaccines, getVaccines, deleteVaccine } = useVaccineStore();
  
  // Local state cho tìm kiếm và phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- STATES QUẢN LÝ MODAL ---
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState(null);

  // --- STATE MỚI CHO FILTER (GIÁ) ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
  });

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    getVaccines();
  }, [getVaccines]);

  // Reset về trang 1 khi search hoặc filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Xử lý tìm kiếm và Lọc (Search & Filter Logic)
  const filteredVaccines = vaccines.filter((vaccine) => {
    // 1. Logic Search (Tên, Code, Hãng)
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      (vaccine.name || '').toLowerCase().includes(term) ||
      (vaccine.code || '').toLowerCase().includes(term) ||
      (vaccine.manufacturer || '').toLowerCase().includes(term)
    );

    // 2. Logic Filter theo Giá (Price Range)
    const vaccinePrice = parseFloat(vaccine.price);
    const min = parseFloat(filters.minPrice);
    const max = parseFloat(filters.maxPrice);

    // Kiểm tra Min Price (nếu người dùng có nhập)
    const matchesMin = !filters.minPrice || (!isNaN(vaccinePrice) && vaccinePrice >= min);

    // Kiểm tra Max Price (nếu người dùng có nhập)
    const matchesMax = !filters.maxPrice || (!isNaN(vaccinePrice) && vaccinePrice <= max);

    return matchesSearch && matchesMin && matchesMax;
  });

  // Xử lý phân trang
  const totalPages = Math.ceil(filteredVaccines.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVaccines.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Helper format giá tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('us-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // --- HANDLERS ---

  const handleRowClick = (vaccine) => {
    setSelectedVaccine(vaccine);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (vaccine) => {
    setVaccineToDelete(vaccine);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (vaccineToDelete) {
      await deleteVaccine(vaccineToDelete.id);
      setIsDeleteOpen(false);
      setVaccineToDelete(null);
    }
  };

  // Hàm reset filter
  const clearFilters = () => {
    setFilters({ minPrice: '', maxPrice: '' });
    setIsFilterOpen(false);
  };

 const handleFilterChange = (e, field) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFilters(prev => ({ ...prev, [field]: value }));
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30 pb-10">
      <Header 
        title="Vaccine Categories" 
        subtitle="List of available vaccines"
        icon={Layers}
        notificationCount={0} 
      />

      {/* --- MODALS SECTION --- */}
      <AddVaccine
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
      />

      <DeleteConfirmationModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={vaccineToDelete?.name}
        isLoading={isLoadingVaccines}
        isPermanent={true}
      />

      <ViewEditVaccine 
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          vaccineData={selectedVaccine}
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
                        placeholder="Search by code, name, manufacturer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full md:w-auto relative"> 
                    
                    {/* --- Nút Filter & Dropdown --- */}
                    <div className="relative">
                        <button 
                            className={`flex items-center justify-center px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                                isFilterOpen || filters.minPrice || filters.maxPrice
                                ? 'bg-teal-50 border-teal-200 text-teal-700' 
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
                                        <span className="font-semibold text-gray-700">Price Range</span>
                                        <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">
                                            Reset
                                        </button>
                                    </div>

                                    {/* Min Price Input */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Min Price ($)</label>
                                        <input 
                                            type="text"
                                            placeholder="e.g. 10"
                                            className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border bg-white text-gray-900 focus:outline-none"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange(e, 'minPrice')}
                                            min="0"
                                        />
                                    </div>

                                    {/* Max Price Input */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Max Price ($)</label>
                                        <input 
                                            type="text"
                                            placeholder="e.g. 1000"
                                            className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border bg-white text-gray-900 focus:outline-none"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange(e, 'maxPrice')}
                                            min="0"
                                        />
                                    </div>
                                    
                                    {/* Nút Apply */}
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

                    {/* Nút Add */}
                    <button 
                        className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg shadow-gray-900/20 transition-all hover:scale-105"
                        onClick={() => setIsAddOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vaccine
                    </button>
                </div>
            </div>

            {/* --- TABLE SECTION ĐÃ CỐ ĐỊNH --- */}
            <div className="overflow-x-auto flex-grow">
                {/* 1. Thêm table-fixed và w-full */}
                <table className="w-full table-fixed divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* 2. Set width cố định cho các cột */}
                            <th scope="col" className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                No
                            </th>
							<th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100 w-16">
                                ID
                            </th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100 w-32">
                                Vaccine Code
                            </th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100">
                                Vaccine Name
                            </th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100 w-60">
                                Manufacturer
                            </th>
                            <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100 w-32">
                                Price
                            </th>
                            <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-l border-gray-100 w-24">
                                Operation
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoadingVaccines ? (
                            <tr>
                               <td colSpan="7" className="px-6 py-20 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" /> 
                                    <span className="text-sm font-medium">Loading vaccines...</span>
                                </div>
                                </td>
                            </tr>
                        ) : currentItems.length > 0 ? (
                            currentItems.map((vaccine, index) => (
                                <tr key={vaccine.id} className="hover:bg-gray-50 transition-colors">
                                     {/* No */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium">
                                        {String(index + 1 + indexOfFirstItem).padStart(3, '0')}
                                    </td>
                                    
									 {/* ID */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium">                                       
                                            {vaccine.id}                
                                    </td>
									
                                    {/* Code: Truncate + Title */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium font-bold text-teal-700 truncate" title={vaccine.code}>
										{vaccine.code}
                                    </td>
                                    
                                    {/* Name: Truncate + Title */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium truncate" title={vaccine.name}>
                                        {vaccine.name}
                                    </td>

                                    {/* Manufacturer: Truncate nội dung bên trong badge */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100" title={vaccine.manufacturer}>
                                         <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-100 inline-block max-w-full truncate">
                                            {vaccine.manufacturer || 'Unknown'}
                                        </span>
                                    </td>
                                    
                                    {/* Price */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-bold border-l border-gray-100">
                                        {formatCurrency(vaccine.price)}
                                    </td>

                                    {/* Operation Buttons */}
                                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium border-l border-gray-100">
                                      <div className="flex items-center justify-center gap-2">
                                        <button 
                                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded" 
                                            title="View details"
                                            onClick={() => handleRowClick(vaccine)}
                                        >
                                            <Eye size={18} />
                                        </button>

                                        <button 
                                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded" 
                                          title="Delete"
                                          onClick={() => handleDeleteClick(vaccine)}
                                        >
                                          <Trash2 size={18} />
                                        </button>
                                      </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-10 text-center text-gray-500 italic">
                                   No vaccines found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- PAGINATION SECTION --- */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-end mt-auto">
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
    </div>
  );
};

export default CategoriesVaccinePage;