import React, { useEffect, useState } from 'react';
import { useReportStore } from '../../store/useReportStore';
import Header from '../../components/Header';
import { 
    Syringe, Search, Filter, 
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
    Loader2
} from 'lucide-react';

const VaccinationStatsPage = () => {
    
    const { 
        vaccinationStats, 
        isLoadingVaccinationStats, 
        getVaccinationStats,
        totalVaccinationPages 
    } = useReportStore();
    
    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isTableLoading, setIsTableLoading] = useState(true);

    // State lưu giá trị đang chọn trong menu filter 
    const [tempPeriod, setTempPeriod] = useState('');
    
    // State lưu giá trị filter ĐÃ APPLY
    const [activePeriod, setActivePeriod] = useState('');

    // --- GỌI API ---
    useEffect(() => {
        setIsTableLoading(true);
        const timer = setTimeout(async () => {
            try {               
                await getVaccinationStats({
                    search: searchTerm,
                    period: activePeriod,
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
    }, [searchTerm, activePeriod, currentPage, getVaccinationStats]);

    // Reset về trang 1 khi search/filter đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activePeriod]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Filter Handlers
    const applyFilters = () => {
        setActivePeriod(tempPeriod);
        setIsFilterOpen(false);
    };

    const clearFilters = () => {
        setTempPeriod('');
        setActivePeriod('');
        setIsFilterOpen(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-stel-50/30 pb-10">
            <Header
                title="Vaccination Statistics"
                subtitle="Report of doses administered and remaining stock"
                icon={Syringe}
                notificationCount={0}
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
                                placeholder="Search Vaccine Code or Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 w-full md:w-auto relative">
                            {/* --- FILTER DROPDOWN --- */}
                            <div className="relative">
                                <button
                                    className={`flex items-center justify-center px-4 py-2.5 border rounded-xl text-sm font-medium transition-colors ${
                                        isFilterOpen || activePeriod
                                            ? 'bg-teal-50 border-teal-200 text-teal-700'
                                            : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                                    }`}
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter Time
                                </button>

                                {isFilterOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                                <span className="font-semibold text-gray-700">Time Period</span>
                                                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">Reset</button>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Select Period</label>
                                                <select
                                                    className="w-full border-gray-200 rounded-lg text-sm focus:ring-teal-500 focus:border-teal-500 p-2 border bg-white text-gray-900 focus:outline-none"
                                                    value={tempPeriod}
                                                    onChange={(e) => setTempPeriod(e.target.value)}
                                                >
                                                    <option value="">All Time</option>
                                                    <option value="today">Today</option>
                                                    <option value="week">This Week</option>
                                                    <option value="month">This Month</option>
                                                    <option value="6months">Last 6 Months</option>
                                                </select>
                                            </div>

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
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto flex-grow">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase w-16">No</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Vaccine Code</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Vaccine Name</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Doses Given</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Remaining Quantity</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(isLoadingVaccinationStats || isTableLoading) ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-gray-500 h-[400px]">
                                            <div className="flex flex-col items-center justify-center h-full">
                                                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" /> 
                                                <span className="text-sm font-medium">Loading statistics...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (vaccinationStats && vaccinationStats.length > 0) ? (
                                    vaccinationStats.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium">
                                                {String((currentPage - 1) * itemsPerPage + index + 1).padStart(3, '0')}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-l border-gray-100 font-mono">
                                                {item.code}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-bold text-teal-800">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100">
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-bold text-xs">
                                                    {item.doses_given} doses
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-bold text-gray-800">                                               
                                                    {item.remaining}                                                
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                                            No vaccination data found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
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
                            
                            {Array.from({ length: totalVaccinationPages || 1 }, (_, i) => i + 1)
                                .slice(Math.max(0, currentPage - 2), Math.min(totalVaccinationPages, currentPage + 1)) 
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
                                disabled={currentPage >= totalVaccinationPages}
                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>

                            <button 
                                onClick={() => handlePageChange(totalVaccinationPages)}
                                disabled={currentPage >= totalVaccinationPages}
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

export default VaccinationStatsPage;