import React, { useEffect, useState } from 'react';
import { useVaccineStore } from '../../store/useVaccineStore';
import Header from '../../components/Header';
import { 
    Package, Search, Filter, X, 
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Loader2, Tag, Factory, FileText, DollarSign, Image as ImageIcon
} from 'lucide-react';

const VaccineStockPage = () => {
    const { vaccines, isLoadingVaccines, getVaccineForEmployee } = useVaccineStore();
    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredVaccines, setFilteredVaccines] = useState([]);
    const [selectedVaccine, setSelectedVaccine] = useState(null);
    
    const itemsPerPage = 10;

    // --- 1. INITIAL LOAD ---
    useEffect(() => {
        getVaccineForEmployee();
    }, [getVaccineForEmployee]);

    // --- 2. FILTER & PAGINATION LOGIC ---
    useEffect(() => {
        let result = vaccines;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(v => 
                v.name?.toLowerCase().includes(lowerTerm) ||
                v.code?.toLowerCase().includes(lowerTerm) ||
                v.manufacturer?.toLowerCase().includes(lowerTerm)
            );
        }

        setFilteredVaccines(result);
        setCurrentPage(1); // Reset to first page on filter change
    }, [vaccines, searchTerm]);

    // Calculate pagination
    const totalItems = filteredVaccines.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredVaccines.slice(startIndex, startIndex + itemsPerPage);

    // --- 3. PAGINATION HANDLERS ---
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // --- 4. FORMAT CURRENCY ---
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30 pb-10">
            <Header
                title="Vaccine Stock"
                subtitle="View all available vaccine details"
                icon={Package}
            />

            <div className="max-w-7xl mx-auto px-6 py-8">
                
                {/* MAIN CARD */}
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
                                placeholder="Search by name, code, or manufacturer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto flex-grow">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase w-10">No</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Image</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Code</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Name</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Manufacturer</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Quantity</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Price</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoadingVaccines ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
                                                <span className="text-sm font-medium">Loading vaccines...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (currentItems && currentItems.length > 0) ? (
                                    currentItems.map((vaccine, index) => (
                                        <tr 
                                            key={vaccine.id} 
                                            onClick={() => setSelectedVaccine(vaccine)}
                                            className="hover:bg-teal-50/50 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium">
                                                {String(startIndex + index + 1).padStart(3, '0')}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100">
                                                {vaccine.image_url ? (
                                                    <img 
                                                        src={vaccine.image_url} 
                                                        alt={vaccine.name} 
                                                        className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-teal-700 font-bold border-l border-gray-100">
                                                {vaccine.code}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 font-semibold border-l border-gray-100">
                                                {vaccine.name}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-600 border-l border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <Factory className="h-4 w-4 text-gray-400" />
                                                    {vaccine.manufacturer}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm border-l border-gray-100">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    vaccine.remaining > 0 
                                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                                        : 'bg-red-100 text-red-700 border border-red-200'
                                                }`}>
                                                    {vaccine.remaining > 0 ? `${vaccine.remaining} doses` : 'Out of Stock'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border-l border-gray-100">
                                                {Number(vaccine.price).toLocaleString('vi-VN')} đ
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

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-auto">
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                                <span className="font-semibold">
                                    {Math.min(startIndex + itemsPerPage, totalItems)}
                                </span>{' '}
                                of <span className="font-semibold">{totalItems}</span> results
                            </div>

                            <div className="flex gap-1">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {[...Array(totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    if (
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                                    currentPage === pageNum
                                                        ? 'bg-teal-600 text-white border-teal-600'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                        return <span key={pageNum} className="px-2 py-2">...</span>;
                                    }
                                    return null;
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* VACCINE DETAIL MODAL */}
            {selectedVaccine && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-teal-600" />
                                Vaccine Details
                            </h3>
                            <button 
                                onClick={() => setSelectedVaccine(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Image Section */}
                                <div className="w-full md:w-1/3 flex-shrink-0">
                                    <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner flex items-center justify-center relative group">
                                        {selectedVaccine.image_url ? (
                                            <img 
                                                src={selectedVaccine.image_url} 
                                                alt={selectedVaccine.name} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <ImageIcon className="w-16 h-16 text-gray-300" />
                                        )}
                                    </div>
                                </div>
                                
                                {/* Details Section */}
                                <div className="w-full md:w-2/3 space-y-6">
                                    <div>
                                        <div className="flex items-start justify-between gap-4">
                                            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedVaccine.name}</h2>
                                            <span className="flex-shrink-0 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-bold border border-teal-200">
                                                {selectedVaccine.code}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 text-gray-600 font-medium">
                                            <Factory className="w-4 h-4" /> 
                                            {selectedVaccine.manufacturer}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                                                <FileText className="w-3 h-3" /> Description
                                            </label>
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {selectedVaccine.description || "No description available for this vaccine."}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-between bg-teal-50 rounded-xl p-4 border border-teal-100">
                                            <label className="text-xs font-bold text-teal-600 uppercase tracking-wider flex items-center gap-1">
                                                <div className="w-3 h-3" /> Price per Dose
                                            </label>
                                            <p className="text-2xl font-bold text-teal-700">
                                                {Number(selectedVaccine.price).toLocaleString('vi-VN')} VNĐ
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button 
                                onClick={() => setSelectedVaccine(null)}
                                className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VaccineStockPage;
