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
import { BarChart as BarIcon, PieChart as PieIcon } from 'lucide-react';
import { CheckCircle, Clock, Newspaper, Calendar, MapPin, Loader2, LayoutDashboard } from 'lucide-react'

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
    getVaccinationRate, 
    getMonthlyStats,
    getTotalCitizens,
  } = useReportStore();

  const { 
   totalCompleted,
   upcomingList,
   getTotalCompleted,
   getUpcomingAppointments
  } = useAppointmentStore();


  useEffect(() => {
    // Call all necessary APIs
	getTotalCompleted();
	getUpcomingAppointments();
    getTotalStock();
    getExpiringBatches();
    getVaccinationRate();
    getMonthlyStats();
    getTotalCitizens();
  }, [getTotalCompleted, getUpcomingAppointments, getTotalStock, getExpiringBatches, getVaccinationRate, getMonthlyStats, getTotalCitizens]);

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

  // Helper function for Lot Status 
  const getLotStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold">Expired</span>;
    if (diffDays <= 30) return <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-semibold">Expiring soon ({diffDays} days)</span>;
    return <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold">Valid</span>;
  };

  const removeFocusOutline = `
    .recharts-wrapper,
    .recharts-wrapper *,
    .recharts-surface,
    .recharts-layer,
    .recharts-sector,
    .recharts-rectangle,
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

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6 px-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-2">Total Injections</p>
          <h3 className="text-3xl font-bold text-gray-800">
            {totalCompleted ? totalCompleted.toLocaleString() : '0'}
          </h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-2">Total Vaccine Stock</p>
          <h3 className="text-3xl font-bold text-gray-800">
            {totalStock ? totalStock.toLocaleString() : '0'}
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-2">Total Citizens</p>
          <h3 className="text-3xl font-bold text-gray-800">
            {totalCitizens || 0}
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-l-yellow-400 border-y border-r border-gray-100">
          <p className="text-gray-500 text-sm font-medium mb-2">Expiring Batches</p>
          <h3 className="text-3xl font-bold text-gray-800">
            {expiringBatches || 0}
          </h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 px-6">
        
        {/* CHART 1: Vaccination Rate */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Vaccination Rate (All Time)</h2>
            {/* Nút Switch Chart */}
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
             {rateChartType === 'pie' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[150%] text-center">
                    <p className="text-sm text-gray-400">Overview</p>
                </div>
             )}
          </div>
        </div>

        {/* CHART 2: Monthly Report */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Monthly Vaccination Status</h2>
            {/* Nút Switch Chart */}
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
             {monthlyChartType === 'pie' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[150%] text-center">
                    <p className="text-sm text-gray-400">Overview</p>
                </div>
             )}
          </div>
        </div>
      </div>

      {/*UPCOMING APPOINTMENTS*/}
      <div className="bg-white rounded-2xl p-6 shadow-sm mx-6 ">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Upcoming Appointments</h2>
            <span className="text-sm text-gray-500">Next 10 bookings</span>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 text-sm uppercase tracking-wider">
                        <th className="pb-4 font-semibold text-gray-500 pl-4">Citizen Name</th>
                        <th className="pb-4 font-semibold text-gray-500">Vaccines</th>
                        <th className="pb-4 font-semibold text-gray-500">Scheduled Time</th>
                        <th className="pb-4 font-semibold text-gray-500">Status</th>
                        <th className="pb-4 font-semibold text-gray-500">Notes</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                    {upcomingList && upcomingList.length > 0 ? (
                        upcomingList.map((apt, index) => (
                            <tr key={apt.id || index} className="border-b last:border-0 border-gray-50 hover:bg-gray-50 transition-colors">
                                {/* Cột 1: Tên công dân */}
                                <td className="py-4 pl-4 font-medium text-gray-900">
                                    {apt.citizen_name}
                                </td>

                                {/* Cột 2: Danh sách vắc xin */}
                                <td className="py-4">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                                        {apt.vaccine_names || 'N/A'}
                                    </span>
                                </td>

                                {/* Cột 3: Thời gian (Format lại cho đẹp) */}
                                <td className="py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800">
                                            {new Date(apt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(apt.time).toLocaleDateString('en-GB')}
                                        </span>
                                    </div>
                                </td>

                                {/* Cột 4: Trạng thái */}
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                        ${apt.status === 'booked' ? 'bg-yellow-100 text-yellow-700' : ''}
                                        ${apt.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                                        ${apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                                        ${!['booked', 'completed', 'cancelled'].includes(apt.status) ? 'bg-gray-100 text-gray-700' : ''}
                                    `}>
                                        {apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : 'Unknown'}
                                    </span>
                                </td>

                                {/* Cột 5: Ghi chú */}
                                <td className="py-4 text-gray-500 italic max-w-xs truncate">
                                    {apt.notes || '-'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="py-8 text-center text-gray-400" colSpan="5">
                                No upcoming appointments found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
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
}

export default DashboardPage;