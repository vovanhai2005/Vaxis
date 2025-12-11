import React, { useEffect, useState, useMemo } from 'react';
import { useReportStore } from '../../store/useReportStore';
import Header from '../../components/Header';
import { 
    Package, Search, Calendar, AlertTriangle, 
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
    Eye, Loader2, Filter, X, Syringe, Box, DollarSign,
    PackageCheck, AlertCircle, TrendingUp, TrendingDown
} from 'lucide-react';

const VaccineStockPage = () => {
    const { inventory, pagination, isLoadingInventory, getInventory } = useReportStore();
    
    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    // Filter states
    const [activeFilters, setActiveFilters] = useState({
        status: '',
        minQuantity: '',
        maxQuantity: '',
        fromDate: '',
        toDate: ''
    });

    const itemsPerPage = 10;

    // --- 1. INITIAL LOAD ---
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

    // --- 2. HANDLE FILTER CHANGE ---
    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setActiveFilters({
            status: '',
            minQuantity: '',
            maxQuantity: '',
            fromDate: '',
            toDate: ''
        });
        setSearchTerm('');
        setCurrentPage(1);
    };

    // --- 3. PAGINATION HANDLERS ---
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // --- 4. FORMAT DATE ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // --- 5. GET EXPIRY STATUS ---
    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return { label: 'Unknown', color: 'gray' };
        
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { label: 'Expired', color: 'red', icon: AlertCircle };
        } else if (diffDays <= 30) {
            return { label: 'Expiring Soon', color: 'orange', icon: AlertTriangle };
        } else if (diffDays <= 90) {
            return { label: 'Warning', color: 'yellow', icon: AlertTriangle };
        } else {
            return { label: 'Good', color: 'green', icon: PackageCheck };
        }
    };

    // --- 6. GET STOCK STATUS ---
    const getStockStatus = (quantity) => {
        if (quantity === 0) {
            return { label: 'Out of Stock', color: 'red', icon: AlertCircle };
        } else if (quantity <= 50) {
            return { label: 'Low Stock', color: 'orange', icon: TrendingDown };
        } else if (quantity <= 100) {
            return { label: 'Medium', color: 'yellow', icon: TrendingUp };
        } else {
            return { label: 'In Stock', color: 'green', icon: PackageCheck };
        }
    };

    // --- 7. STATS CALCULATION ---
    const stats = useMemo(() => {
        if (!inventory || inventory.length === 0) {
            return {
                totalLots: 0,
                totalQuantity: 0,
                expiringSoon: 0,
                lowStock: 0
            };
        }

        const totalLots = pagination?.totalItems || inventory.length;
        const totalQuantity = inventory.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        const expiringSoon = inventory.filter(item => {
            const status = getExpiryStatus(item.expiry_date);
            return status.label === 'Expiring Soon' || status.label === 'Warning';
        }).length;
        const lowStock = inventory.filter(item => parseInt(item.quantity) <= 50).length;

        return { totalLots, totalQuantity, expiringSoon, lowStock };
    }, [inventory, pagination]);

    // --- 8. RENDER BADGE ---
    const renderBadge = (status) => {
        const colorMap = {
            red: 'bg-red-100 text-red-700 border-red-200',
            orange: 'bg-orange-100 text-orange-700 border-orange-200',
            yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            green: 'bg-green-100 text-green-700 border-green-200',
            gray: 'bg-gray-100 text-gray-700 border-gray-200'
        };

        const Icon = status.icon || PackageCheck;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorMap[status.color]}`}>
                <Icon className="w-3 h-3" />
                {status.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30 pb-10">
            <Header
                title="Vaccine Stock Management"
                subtitle="View and monitor vaccine inventory"
                icon={Package}
            />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Lots</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLots}</p>
                            </div>
                            <div className="bg-teal-100 p-3 rounded-xl">
                                <Box className="w-8 h-8 text-teal-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Quantity</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalQuantity}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <Syringe className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Expiring Soon</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.expiringSoon}</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-xl">
                                <AlertTriangle className="w-8 h-8 text-orange-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Low Stock</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">{stats.lowStock}</p>
                            </div>
                            <div className="bg-red-100 p-3 rounded-xl">
                                <TrendingDown className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

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
                                placeholder="Search by lot number, vaccine name, or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                                {(activeFilters.status || activeFilters.minQuantity || activeFilters.maxQuantity || activeFilters.fromDate || activeFilters.toDate) && (
                                    <span className="bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                        {[activeFilters.status, activeFilters.minQuantity, activeFilters.maxQuantity, activeFilters.fromDate, activeFilters.toDate].filter(Boolean).length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* FILTERS PANEL */}
                    {showFilters && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-700">Filter Options</h3>
                                <button
                                    onClick={handleClearFilters}
                                    className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Clear All
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {/* Expiry Status */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Expiry Status
                                    </label>
                                    <select
                                        value={activeFilters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">All</option>
                                        <option value="valid">Valid</option>
                                        <option value="expiring_soon">Expiring Soon</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>

                                {/* Min Quantity */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Min Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={activeFilters.minQuantity}
                                        onChange={(e) => handleFilterChange('minQuantity', e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                {/* Max Quantity */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Max Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={activeFilters.maxQuantity}
                                        onChange={(e) => handleFilterChange('maxQuantity', e.target.value)}
                                        placeholder="1000"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                {/* From Date */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Expiry From
                                    </label>
                                    <input
                                        type="date"
                                        value={activeFilters.fromDate}
                                        onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                {/* To Date */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Expiry To
                                    </label>
                                    <input
                                        type="date"
                                        value={activeFilters.toDate}
                                        onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TABLE */}
                    <div className="overflow-x-auto flex-grow">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase w-10">No</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Lot Number</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Vaccine Code</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Vaccine Name</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Quantity</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Stock Status</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Expiry Date</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase border-l border-gray-100">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isTableLoading || isLoadingInventory ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
                                                <span className="text-sm font-medium">Loading vaccine lots...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (inventory && inventory.length > 0) ? (
                                    inventory.map((lot, index) => {
                                        const expiryStatus = getExpiryStatus(lot.expiry_date);
                                        const stockStatus = getStockStatus(lot.quantity);

                                        return (
                                            <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium">
                                                    {String((currentPage - 1) * itemsPerPage + index + 1).padStart(3, '0')}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-bold text-teal-700">
                                                    {lot.lot_number}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-l border-gray-100">{lot.code}</td>
                                                <td className="px-4 py-4 text-sm text-gray-900 border-l border-gray-100 font-semibold">
                                                    {lot.name}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm border-l border-gray-100">
                                                    <span className="font-bold text-gray-900">{lot.quantity}</span>
                                                    <span className="text-xs text-gray-500 ml-1">units</span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm border-l border-gray-100">
                                                    {renderBadge(stockStatus)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 border-l border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {formatDate(lot.expiry_date)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm border-l border-gray-100">
                                                    {renderBadge(expiryStatus)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-10 text-center text-gray-500 italic">
                                            No vaccine lots found matching criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-auto">
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-semibold">
                                    {Math.min(currentPage * itemsPerPage, pagination.totalItems)}
                                </span>{' '}
                                of <span className="font-semibold">{pagination.totalItems}</span> results
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

                                {[...Array(pagination.totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    if (
                                        pageNum === 1 ||
                                        pageNum === pagination.totalPages ||
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
                                    disabled={currentPage === pagination.totalPages}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.totalPages)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VaccineStockPage;
