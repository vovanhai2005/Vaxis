import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Header from '../../components/Header';
import { Calendar, Syringe, Clock, AlertCircle, Home, Newspaper, ArrowRight } from 'lucide-react';
import { axiosInstance } from '../../lib/axios';
import toast from 'react-hot-toast';

const EmployeeDashboardPage = () => {
  const { authUser } = useAuthStore();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [healthNews, setHealthNews] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchHealthNews();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get('/appointments/upcoming');
      // Filter for future appointments or just take the top ones returned by API
      // The API seems to return all, so let's slice
      setUpcomingAppointments(res.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHealthNews = async () => {
    const rssUrls = [
      'https://tuoitre.vn/rss/suc-khoe.rss',
      'https://vnexpress.net/rss/suc-khoe.rss'
    ];

    try {
      const feedPromises = rssUrls.map(url => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`)
          .then(res => res.json())
      );

      const feeds = await Promise.all(feedPromises);
      let allItems = [];

      feeds.forEach(feed => {
        if (feed.status === 'ok') {
          const source = feed.feed.url.includes('vnexpress') ? 'VnExpress' : 'Tuoi Tre';
          const items = feed.items.map(item => ({ ...item, source }));
          allItems = [...allItems, ...items];
        }
      });

      // Sort by pubDate descending
      allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      // Take top 5 and format
      const formattedNews = allItems.slice(0, 5).map((item, index) => {
        // Strip HTML from description
        const div = document.createElement('div');
        div.innerHTML = item.description;
        const summary = div.textContent || div.innerText || '';

        return {
          id: index,
          title: item.title,
          summary: summary.length > 100 ? summary.substring(0, 100) + '...' : summary,
          source: item.source,
          date: new Date(item.pubDate).toLocaleDateString('vi-VN'),
          link: item.link
        };
      });

      setHealthNews(formattedNews);
    } catch (error) {
      console.error('Error fetching health news:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'checked_in': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'booked': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-teal-50/30 pb-10">
      <Header
        title={`Welcome back, ${authUser?.full_name || 'Employee'}!`}
        subtitle="Employee Dashboard"
        icon={Home}
      />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-white via-white to-teal-50/30">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-xl text-teal-600">
                      <Calendar className="h-6 w-6" />
                    </div>
                    Upcoming Schedule
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 ml-1">Manage your upcoming patient visits</p>
                </div>
                <div className="flex items-center gap-3">
                  <a 
                    href="/upcoming-appointments"
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-all shadow-sm hover:shadow-md hover:shadow-teal-500/20"
                  >
                    View All <ArrowRight className="h-4 w-4" />
                  </a>
                  <button 
                    onClick={fetchDashboardData} 
                    className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm hover:shadow-md"
                  >
                    <span className="group-hover:animate-spin-once">↻</span> Refresh
                  </button>
                </div>
              </div>
              
              <div className="p-6 flex-1 bg-gray-50/50">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full py-20">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-teal-500"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-2 w-2 bg-teal-500 rounded-full"></div>
                      </div>
                    </div>
                    <p className="text-gray-400 mt-4 font-medium animate-pulse">Syncing schedule...</p>
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((apt, index) => (
                      <div 
                        key={apt.id} 
                        className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 hover:border-teal-200 transition-all duration-300 ease-out transform hover:-translate-y-1"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Date Badge */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
                          <span className="text-xs font-bold uppercase tracking-wider opacity-90">{new Date(apt.scheduled_at || apt.time).toLocaleDateString('en-US', { month: 'short' })}</span>
                          <span className="text-2xl font-black leading-none mt-0.5">{new Date(apt.scheduled_at || apt.time).getDate()}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-teal-700 transition-colors">
                              {apt.full_name}
                            </h4>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(apt.status)}`}>
                              {apt.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 group-hover:bg-teal-50/50 group-hover:border-teal-100 transition-colors">
                              <Clock className="h-4 w-4 text-teal-500" />
                              <span className="font-medium text-gray-700">
                                {new Date(apt.scheduled_at || apt.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Syringe className="h-4 w-4 text-purple-500" />
                              <span className="truncate font-medium text-gray-600">
                                {apt.vaccine_names || 'General Vaccination'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Decorative Side Accent */}
                        <div className="absolute left-0 top-6 bottom-6 w-1 bg-teal-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                      <Calendar className="h-12 w-12 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No appointments today</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">Your schedule is clear. Enjoy your free time or check back later for updates.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Health News */}
          <div className="lg:col-span-1 space-y-8">
            {/* Health News */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Newspaper className="text-blue-600 h-5 w-5" />
                  Health News
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {healthNews.map((item) => (
                    <div 
                      key={item.id} 
                      className="group cursor-pointer"
                      onClick={() => window.open(item.link, '_blank')}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {item.source}
                        </span>
                        <span className="text-xs text-gray-400">{item.date}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {item.summary}
                      </p>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  View All News
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;
