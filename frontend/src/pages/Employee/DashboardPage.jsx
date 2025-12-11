import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Header from '../../components/Header';
import { Users, Calendar, Syringe, CheckCircle, Clock, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { axiosInstance } from '../../lib/axios';
import toast from 'react-hot-toast';

const EmployeeDashboardPage = () => {
  const { authUser } = useAuthStore();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completedToday: 0,
    pendingToday: 0,
    totalCitizens: 0,
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch employee dashboard stats
      const statsRes = await axiosInstance.get('/appointments/upcoming');
      
      // Process the data
      const today = new Date().toDateString();
      const todayAppts = statsRes.data.filter(apt => 
        new Date(apt.scheduled_at).toDateString() === today
      );
      
      setStats({
        todayAppointments: todayAppts.length,
        completedToday: todayAppts.filter(apt => apt.status === 'completed').length,
        pendingToday: todayAppts.filter(apt => apt.status === 'booked' || apt.status === 'checked_in').length,
        totalCitizens: statsRes.data.length,
        recentActivities: statsRes.data.slice(0, 5)
      });
      
      setUpcomingAppointments(statsRes.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'checked_in':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'booked':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-4 rounded-lg`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30 pb-10">
      <Header
        title={`Welcome back, ${authUser?.full_name || 'Employee'}!`}
        subtitle="Employee Dashboard - Manage daily operations"
        icon={Activity}
      />

      <div className="px-6 mt-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="Today's Appointments"
            value={isLoading ? '...' : stats.todayAppointments}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed Today"
            value={isLoading ? '...' : stats.completedToday}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={Clock}
            title="Pending Today"
            value={isLoading ? '...' : stats.pendingToday}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatCard
            icon={Users}
            title="Total Citizens"
            value={isLoading ? '...' : stats.totalCitizens}
            color="text-teal-600"
            bgColor="bg-teal-50"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="text-teal-600" />
                Upcoming Appointments
              </h3>
              <button
                onClick={fetchDashboardData}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading appointments...</p>
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-gray-900">
                            {appointment.full_name || 'Citizen'}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(appointment.scheduled_at)}
                          </p>
                          {appointment.vaccine_names && (
                            <p className="flex items-center gap-2">
                              <Syringe className="h-4 w-4" />
                              {appointment.vaccine_names}
                            </p>
                          )}
                          {appointment.notes && (
                            <p className="text-gray-500 italic text-xs">
                              Note: {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming appointments</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-teal-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <a
                href="/lookup-citizen"
                className="block w-full p-4 bg-teal-50 hover:bg-teal-100 rounded-lg text-teal-700 font-medium text-center transition-colors"
              >
                Lookup Citizen
              </a>
              <button
                onClick={fetchDashboardData}
                className="block w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium text-center transition-colors"
              >
                Refresh Dashboard
              </button>
              <a
                href="/profile"
                className="block w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium text-center transition-colors"
              >
                View Profile
              </a>
            </div>

            {/* Today's Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Today's Summary</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Appointments</span>
                  <span className="font-bold text-gray-900">{stats.todayAppointments}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-bold text-green-600">{stats.completedToday}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-bold text-yellow-600">{stats.pendingToday}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                  <span className="text-gray-600">Completion Rate</span>
                  <span className="font-bold text-teal-600">
                    {stats.todayAppointments > 0
                      ? `${Math.round((stats.completedToday / stats.todayAppointments) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;
