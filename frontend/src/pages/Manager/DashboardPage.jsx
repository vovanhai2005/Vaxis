import React, { useEffect, useState } from 'react';
import { useVaccineLotStore } from '../../store/useVaccineLotStore';
import { useReportStore } from '../../store/useReportStore';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Header from '../../components/Header';
// Đã thêm các icon mới vào import bên dưới
import { 
  BarChart as BarIcon, 
  PieChart as PieIcon, 
  LayoutDashboard, 
  TrendingUp,
  Syringe,          // Icon cho mũi tiêm
  Package,          // Icon cho kho
  Users,            // Icon cho công dân
  Loader2,
  AlertTriangle     // Icon cảnh báo hết hạn
} from 'lucide-react';

const DashboardPage = () => {
  const { authUser } = useAuthStore();
  const [rateChartType, setRateChartType] = useState('pie');
  const [monthlyChartType, setMonthlyChartType] = useState('bar');
  
  const { 
    totalStock, 
    expiringBatches, 
    getTotalStock, 
    getExpiringBatches 
  } = useVaccineLotStore();

  // Get inventory from ReportStore
  const { 
    vaccinationRate, 
    monthlyStats,
    totalCitizens,
	isLoading,
    vaccinationStatsLimit10,
    getVaccinationRate, 
    getMonthlyStats,
    getVaccinationStatsLimit10,
    getTotalCitizens,
  } = useReportStore();

  const { 
   totalCompleted,
   getTotalCompleted
  } = useAppointmentStore();


  useEffect(() => {
    // Call all necessary APIs
    getTotalCompleted();    
    getTotalStock();
    getExpiringBatches();
    getVaccinationRate();
    getMonthlyStats();
    getTotalCitizens();
    getVaccinationStatsLimit10(); // Gọi API lấy top 10
  }, [getTotalCompleted, getTotalStock, getExpiringBatches, getVaccinationRate, getMonthlyStats, getTotalCitizens, getVaccinationStatsLimit10]);

  // Chart Data Configuration 
  const pieChartData = [
    { name: 'Completed', value: vaccinationRate?.da_tiem || 0, color: '#22c55e' }, 
    { name: 'Pending', value: vaccinationRate?.chua_tiem || 0, color: '#fbbf24' },  
    { name: 'Overdue', value: vaccinationRate?.qua_han || 0, color: '#ef4444' },   
  ];
  const barChartData = [
    { name: 'Completed', value: monthlyStats?.da_tiem || 0, color: '#22c55e' }, 
    { name: 'Pending', value: monthlyStats?.chua_tiem || 0, color: '#fbbf24' },  
    { name: 'Overdue', value: monthlyStats?.qua_han || 0, color: '#ef4444' },   
  ];

 const renderPieChart = (data) => (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}`} />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );

  // Hàm render Bar Chart tái sử dụng
  const renderBarChart = (data) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        barSize={40}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
        <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  const removeFocusOutline = `
    .recharts-wrapper,
    .recharts-wrapper *,
    .recharts-surface,
    .recharts-layer,
    path, 
    rect {
        outline: none !important;
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30 pb-10">
    <style>{removeFocusOutline}</style>
      <Header 
        title="Dashboard" 
        subtitle={`Welcome back, ${authUser?.full_name || authUser?.username || 'Manager'}`}
         icon={LayoutDashboard}
        notificationCount={0} 
      />

      {/* Stats Cards Section - ĐÃ CẬP NHẬT ICONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6 px-6">
        
        {/* CARD 1: Total Injections */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-2">Total Injections</p>
                <h3 className="text-3xl font-bold text-gray-800">
                    {totalCompleted ? totalCompleted.toLocaleString() : '0'}
                </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Syringe size={24} />
            </div>
        </div>

        {/* CARD 2: Total Vaccine Stock */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-2">Total Vaccine Stock</p>
                <h3 className="text-3xl font-bold text-gray-800">
                    {totalStock ? totalStock.toLocaleString() : '0'}
                </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Package size={24} />
            </div>
        </div>

        {/* CARD 3: Total Citizens */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-2">Total Citizens</p>
                <h3 className="text-3xl font-bold text-gray-800">
                    {totalCitizens || 0}
                </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users size={24} />
            </div>
        </div>

        {/* CARD 4: Expiring Batches */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-yellow-400 border-y border-r border-gray-100 flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-2">Expiring Batches</p>
                <h3 className="text-3xl font-bold text-gray-800">
                    {expiringBatches || 0}
                </h3>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <AlertTriangle size={24} />
            </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 px-6">
        
        {/* CHART 1: Vaccination Rate */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Vaccination Rate (All Time)</h2>
            <button 
                onClick={() => setRateChartType(prev => prev === 'pie' ? 'bar' : 'pie')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-blue-600"
                title="Switch Chart Type"
            >
                {rateChartType === 'pie' ? <BarIcon size={20} /> : <PieIcon size={20} />}
            </button>
          </div>
          
          <div className="h-64 relative">
             {rateChartType === 'pie' ? renderPieChart(pieChartData) : renderBarChart(pieChartData)}
          </div>
        </div>

        {/* CHART 2: Monthly Report */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Monthly Vaccination Status</h2>
            <button 
                onClick={() => setMonthlyChartType(prev => prev === 'bar' ? 'pie' : 'bar')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-blue-600"
                title="Switch Chart Type"
            >
                {monthlyChartType === 'bar' ? <PieIcon size={20} /> : <BarIcon size={20} />}
            </button>
          </div>

          <div className="h-64 relative">
             {monthlyChartType === 'bar' ? renderBarChart(barChartData) : renderPieChart(barChartData)}
          </div>
        </div>
      </div>

{/* TOP 10 VACCINES TABLE */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mx-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
             {/* Thêm icon TrendingUp để nhấn mạnh thống kê */}
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <TrendingUp size={20} />
            </div>
            <div>
                {/* SỬA LẠI TITLE CHO ĐÚNG */}
                <h2 className="text-lg font-bold text-gray-800">Top 10 Most Administered Vaccines</h2>
                <span className="text-sm text-gray-500">Based on total doses given</span>
            </div>
        </div>
        
        <div className="overflow-x-auto">
            {/* THÊM table-fixed */}
            <table className="w-full table-fixed text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 text-sm uppercase tracking-wider">
                        {/* Cột ID: w-16 */}
                        <th className="pb-4 font-semibold text-gray-500 pl-4 w-16">ID</th>
                        {/* Cột Code: w-32 */}
                        <th className="pb-4 font-semibold text-gray-500 w-40">Code</th>
                        {/* Cột Name: Không set width để tự giãn */}
                        <th className="pb-4 font-semibold text-gray-500">Vaccine Name</th>
                        {/* Cột Doses: w-32 */}
                        <th className="pb-4 font-semibold text-gray-500 w-32">Doses Given</th>
                        {/* Cột Stock: w-40 */}
                        <th className="pb-4 font-semibold text-gray-500 w-40">Remaining Stock</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                    {isLoading ? (
                        <tr>
                            <td colSpan="5" className="py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                    <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-2" />
                                    <span className="text-sm font-medium">Loading vaccination data...</span>
                                </div>
                            </td>
                        </tr>
                    ) : vaccinationStatsLimit10 && vaccinationStatsLimit10.length > 0 ? (
                        vaccinationStatsLimit10.map((vac, index) => (
                            <tr key={vac.id || index} className="border-b last:border-0 border-gray-50 hover:bg-gray-50 transition-colors">
                                {/* Cột 1: ID */}                               
                                <td className="py-4">
                                    <span className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 border-l border-gray-100 font-medium">
                                        {vac.id || 'N/A'}
                                    </span>
                                </td>

                                {/* Cột 2: Code - Thêm truncate + title */}
                                <td className="py-4 truncate" title={vac.code}>
                                    <span className="px-4 py-4 text-sm text-gray-500 border-l border-gray-100 font-mono">
                                        {vac.code || 'N/A'}
                                    </span>
                                </td>

                                {/* Cột 3: Tên Vaccine - Thêm truncate + title */}
                                <td className="px-4 py-4 text-sm text-gray-900 border-l border-gray-100 font-bold text-teal-800 truncate" title={vac.name}>
                                    {vac.name || 'N/A'}
                                </td>

                                {/* Cột 4: Số mũi đã tiêm */}
                                <td className="py-4">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-bold text-xs inline-block truncate max-w-full">
                                        {vac.doses_given ? vac.doses_given.toLocaleString() : '0'} doses
                                    </span>
                                </td>
                                
                                {/* Cột 5: Tồn kho */}
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                        vac.remaining > 10 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                        {vac.remaining ? vac.remaining.toLocaleString() : '0'}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="py-8 text-center text-gray-400" colSpan="5">
                                No vaccination data found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>   
    </div>
  );
}

export default DashboardPage;