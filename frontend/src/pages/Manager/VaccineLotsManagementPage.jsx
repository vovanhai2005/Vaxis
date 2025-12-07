import React, { useEffect, useState } from 'react';
import { useReportStore } from '../../store/useReportStore';
import Header from '../../components/Header';
import AddVaccineLot from '../../components/AddVaccineLot';
import { useVaccineLotStore } from '../../store/useVaccineLotStore';
import ViewEditVaccineLot from '../../components/ViewEditVaccineLot';
import { 
    Package, Search, Plus, Filter, 
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
    Eye, Loader2, Calendar, Trash2
} from 'lucide-react';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'; 

const VaccineLotsManagementPage = () => {
    
    const { inventory, isLoadingInventory, getInventory, updateInventoryItem } = useReportStore();
    const { deleteLot } = useVaccineLotStore();
    
    // Local state cho tìm kiếm và phân trang
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(0); 

    // --- 1. STATE QUẢN LÝ FILTER (MỚI) ---
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isTableLoading, setIsTableLoading] = useState(true);

    // State lưu giá trị đang nhập trong menu filter 
    const [tempFilters, setTempFilters] = useState({
        status: '',       
        minQuantity: '',
        maxQuantity: '',
        fromDate: '',    
        toDate: ''       
    });

    // State lưu giá trị filter ĐÃ APPLY (dùng để gọi API)
    const [activeFilters, setActiveFilters] = useState({
        status: '',
        minQuantity: '',
        maxQuantity: '',
        fromDate: '',
        toDate: ''
    });
    
    // State Modal Xem/Sửa/Xóa
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedLot, setSelectedLot] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [lotToDelete, setLotToDelete] = useState(null);

    // --- 2. GỌI API KHI ACTIVE FILTERS THAY ĐỔI ---
    useEffect(() => {
        setIsTableLoading(true);
        const timer = setTimeout(async () => {
            try {               
                await getInventory({
                    search: searchTerm,
                    expiry_status: activeFilters.status,
                    min_quantity: activeFilters.minQuantity,
                    max_quantity: activeFilters.maxQuantity,
                    from_date: activeFilters.fromDate,
                    to_date: activeFilters.toDate,
                    page: currentPage,
                    limit: itemsPerPage
                });
            } catch (error) {
                console.error(error);
            } finally {         
                setIsTableLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, activeFilters, currentPage, getInventory]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeFilters]);

    // Cập nhật totalPages khi inventory thay đổi
    useEffect(() => {
        const storeTotalPages = useReportStore.getState().totalPages || 1; 
        setTotalPages(storeTotalPages);
    }, [inventory]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
   
    // Xử lý nhập liệu trong menu dropdown
    const handleFilterChange = (e, field) => {
        const value = e.target.value;
       
        if ((field === 'minQuantity' || field === 'maxQuantity') && value !== '' && !/^\d+$/.test(value)) {
            return;
        }
        setTempFilters(prev => ({ ...prev, [field]: value }));
    };

    // Nút "Apply Filters"
    const applyFilters = () => {
        setActiveFilters(tempFilters);
        setIsFilterOpen(false);
    };

    // Nút "Reset"
    const clearFilters = () => {
        const emptyState = {
            status: '',
            minQuantity: '',
            maxQuantity: '',
            fromDate: '',
            toDate: ''
        };
        setTempFilters(emptyState);
        setActiveFilters(emptyState);
        setIsFilterOpen(false);
    };

    // --- Helper Functions UI ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const renderStatus = (expiryDate) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const daysDiff = (expiry - now) / (1000 * 60 * 60 * 24);

        if (daysDiff < 0) {
            return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold border border-red-200">Expired</span>;
        } else if (daysDiff <= 30) {
            return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold border border-orange-200">Expiring Soon</span>;
        } else {
            return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold border border-green-200">Valid</span>;
        }
    };

    const handleRowClick = (lot) => {
        setSelectedLot(lot);
        setIsViewModalOpen(true);
    };

    const handleDeleteClick = (lot) => {
        setLotToDelete(lot);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (lotToDelete) {
            try {
                await deleteLot(lotToDelete.id);
                 try {
                    // Refresh lại data với các filter hiện tại
                    await getInventory({
                        search: searchTerm,
                        expiry_status: activeFilters.status,
                        min_quantity: activeFilters.minQuantity,
                        max_quantity: activeFilters.maxQuantity,
                        from_date: activeFilters.fromDate,
                        to_date: activeFilters.toDate,
                        page: currentPage,
                        limit: itemsPerPage
                    });
                } catch (error) {
                    console.error("Refresh failed", error);
                }
                setIsDeleteOpen(false);
                setLotToDelete(null);
            } catch (error) {
                console.error("Xóa thất bại", error);
            }
        }
    };

    const handleRefreshData = async () => {
        setIsRefreshing(true); 
        try {
            await getInventory({
                search: searchTerm,
                expiry_status: activeFilters.status,
                min_quantity: activeFilters.minQuantity,
                max_quantity: activeFilters.maxQuantity,
                from_date: activeFilters.fromDate,
                to_date: activeFilters.toDate,
                page: currentPage,
                limit: itemsPerPage
            });
        } catch (error) {
            console.error("Refresh failed", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleUpdateSuccess = (updatedLot) => {
        updateInventoryItem(updatedLot);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30 pb-10">
            <Header
                title="Vaccine Lots Management"
                subtitle="List of inventory report"
                icon={Package}
                notificationCount={0}
            />

            <AddVaccineLot 
                isOpen={isAddOpen} 
                onClose={() => setIsAddOpen(false)}
                onSuccess={handleRefreshData}   
            />

            <DeleteConfirmationModal 
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={lotToDelete?.lot_number ? `${lotToDelete.lot_number}` : 'this batch'}
                isLoading={isLoadingInventory} 
                isPermanent={true}
            />

             <ViewEditVaccineLot 
                isOpen={isViewModalOpen} 
                onClose={() => setIsViewModalOpen(false)} 
                lotData={selectedLot}   
                onSuccess={handleUpdateSuccess}              
             /> 

            <div className="px-6 mt-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[600px] flex flex-col">

                    {/* TOOLBAR */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                placeholder="Search Lot Number, code, name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 w-full md:w-auto relative">
                            {/* --- FILTER DROPDOWN (Đã cập nhật) --- */}
                            <div className="relative">
                                <button
                                    className={`flex items-center justify-center px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                                        isFilterOpen || activeFilters.status || activeFilters.minQuantity || activeFilters.fromDate
                                            ? 'bg-teal-50 border-teal-200 text-teal-700'
                                            : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                                    }`}
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </button>

                                {isFilterOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                                <span className="font-semibold text-gray-700">Filter Options</span>
                                                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">Reset All</button>
                                            </div>
                                            
                                            {/* 1. Status Filter (Giữ nguyên) */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Expiry Status</label>
                                                <select
                                                    className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border bg-white text-gray-900 focus:outline-none"
                                                    value={tempFilters.status}
                                                    onChange={(e) => handleFilterChange(e, 'status')}
                                                >
                                                    <option value="">All Batches</option>
                                                    <option value="con_han">Valid (> 30 days)</option>
                                                    <option value="sap_het">Expiring Soon (≤ 30 days)</option>
                                                    <option value="qua_han">Expired</option>
                                                </select>
                                            </div>

                                            {/* 2. Quantity Range Filter (Mới) */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Min Quantity</label>
                                                    <input 
                                                        type="text"
                                                        placeholder="0"
                                                        className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border bg-white text-gray-900 focus:outline-none"
                                                        value={tempFilters.minQuantity}
                                                        onChange={(e) => handleFilterChange(e, 'minQuantity')}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Max Quantity</label>
                                                    <input 
                                                        type="text"
                                                        placeholder="e.g 1000"
                                                        className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border bg-white text-gray-900 focus:outline-none"
                                                        value={tempFilters.maxQuantity}
                                                        onChange={(e) => handleFilterChange(e, 'maxQuantity')}
                                                    />
                                                </div>
                                            </div>

                                            {/* 3. Expiry Date Range Filter */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Expiry Date Range</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input 
                                                        type="date"
                                                        className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border bg-white text-gray-900 focus:outline-none dark:text-gray-900"
                                                        style={{ colorScheme: 'light' }}
														value={tempFilters.fromDate}
                                                        onChange={(e) => handleFilterChange(e, 'fromDate')}
                                                    />
                                                    <input 
                                                        type="date"
                                                        className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border bg-white text-gray-900 focus:outline-none dark:text-gray-900"
                                                        style={{ colorScheme: 'light' }}
														value={tempFilters.toDate}
                                                        onChange={(e) => handleFilterChange(e, 'toDate')}
                                                    />
                                                </div>
                                            </div>

                                            {/* Apply Button */}
                                            <button 
                                                onClick={applyFilters} 
                                                className="w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-700 transition-colors mt-2"
                                            >
                                                Apply Filters
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                className="flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-gray-900/20 transition-all hover:scale-105"
                                onClick={() => setIsAddOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Import Batch
                            </button>
                        </div>
                    </div>

                    {/* TABLE (Giữ nguyên) */}
                    <div className="overflow-x-auto flex-grow">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase w-10">No</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Lot Number</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Vaccine Code</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Vaccine Name</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Quantity</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Expiry Date</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Status</th>
                                    <th className="px-4 py-4 text-center text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(isLoadingInventory || isRefreshing || isTableLoading) ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-20 text-center text-gray-500 h-[400px]">
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" /> 
                                                <span className="text-sm font-medium">Loading vaccine lots...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (inventory && inventory.length > 0) ? (
                                    inventory.map((lot, index) => (
                                        <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium">
                                                {String((currentPage - 1) * itemsPerPage + index + 1).padStart(3, '0')}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-bold text-teal-700">
                                                {lot.lot_number}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-l border-gray-100">{lot.code}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium">{lot.name}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-bold">{lot.quantity}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {formatDate(lot.expiry_date)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm border-l border-gray-100">
                                                {renderStatus(lot.expiry_date)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium border-l border-gray-100">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                                        title="View Details"
                                                        onClick={() => handleRowClick(lot)}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button 
                                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded" 
                                                        title="Delete"
                                                        onClick={() => handleDeleteClick(lot)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-10 text-center text-gray-500 italic">
                                            No vaccine batches found matching criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION (Giữ nguyên) */}
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
                            
                            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1)
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
                                disabled={currentPage >= totalPages}
                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>

                            <button 
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage >= totalPages}
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
                <span className="absolute right-full mr-3 bg-gray-900 text-white text-sm font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Help?</span>
            </button>
        </div>
    );
};

export default VaccineLotsManagementPage;