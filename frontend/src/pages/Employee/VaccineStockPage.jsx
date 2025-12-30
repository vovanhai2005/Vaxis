import React, { useEffect, useState } from 'react';
import { useReportStore } from '../../store/useReportStore';
import Header from '../../components/Header';
import { 
    Package, Search, X, 
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Loader2, Factory, Image as ImageIcon
} from 'lucide-react';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const VaccineStockPage = () => {
    
    const { 
        vaccinationStats,           
        totalVaccinationPages,     
        isLoadingVaccinationStats,  
        getVaccinationStats         
    } = useReportStore();

    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVaccine, setSelectedVaccine] = useState(null);
    
    const debouncedSearch = useDebounce(searchTerm, 500);
    const itemsPerPage = 10;

    // --- 2. FETCH DATA TỪ REPORT STORE ---
    useEffect(() => {
        getVaccinationStats({ 
            page: currentPage, 
            limit: itemsPerPage, 
            search: debouncedSearch 
        });
    }, [currentPage, debouncedSearch, getVaccinationStats]);

    // Reset về trang 1 khi search thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    // --- 3. XỬ LÝ PHÂN TRANG ---
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalVaccinationPages) {
            setCurrentPage(page);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;

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
                                placeholder="Search by name, code..."
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
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Remaining</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Price</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoadingVaccinationStats ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
                                                <span className="text-sm font-medium">Loading data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (vaccinationStats && vaccinationStats.length > 0) ? (
                                    // Map dữ liệu từ Store Report
                                    vaccinationStats.map((vaccine, index) => (
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
                                                    <img src={vaccine.image_url} alt={vaccine.name} className="h-12 w-12 object-cover rounded-lg border border-gray-200" />
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

                                            {/* HIỂN THỊ REMAINING (Đã tính toán từ Server) */}
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

                    {/* PAGINATION UI */}
                    {totalVaccinationPages > 1 && (
                        <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-auto">
                            <div className="text-sm text-gray-600">
                                Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalVaccinationPages}</span>
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

                                <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                                    {currentPage}
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalVaccinationPages}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalVaccinationPages)}
                                    disabled={currentPage === totalVaccinationPages}
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
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-teal-600" />
                                Vaccine Details
                            </h3>
                            <button onClick={() => setSelectedVaccine(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-1/3 flex-shrink-0">
                                    <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner flex items-center justify-center relative">
                                        {selectedVaccine.image_url ? (
                                            <img src={selectedVaccine.image_url} alt={selectedVaccine.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-16 h-16 text-gray-300" />
                                        )}
                                    </div>
                                </div>
                                
                                <div className="w-full md:w-2/3 space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedVaccine.name}</h2>
                                        <span className="text-sm text-teal-700 font-bold">{selectedVaccine.code}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-teal-50 p-3 rounded-xl border border-teal-100">
                                            <label className="text-xs font-bold text-teal-600 uppercase">Remaining</label>
                                            <p className="text-xl font-bold text-teal-700">{selectedVaccine.remaining || 0}</p>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                            <label className="text-xs font-bold text-blue-600 uppercase">Given</label>
                                            <p className="text-xl font-bold text-blue-700">{selectedVaccine.doses_given || 0}</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-700 text-sm">{selectedVaccine.description || "No description."}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VaccineStockPage;