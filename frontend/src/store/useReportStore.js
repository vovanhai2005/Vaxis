import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useReportStore = create((set) => ({
    // STATE
    vaccinationRate: null,
    monthlyStats: null,
    inventory: [],
    vaccinationStats: [],
    totalCitizens: 0,
	totalVaccinationPages: 1,
	vaccinationStatsLimit10: [], 
    // Loading flags
    isLoadingRate: false,
    isLoadingMonthly: false,
    isLoadingInventory: false,
    isLoadingVaccinationStats: false,
    isLoadingTotalCitizens: false,

    //  Tỷ lệ tiêm (completed / booked / quá hạn)
    getVaccinationRate: async () => {
        set({ isLoadingRate: true });
        try {
            const res = await axiosInstance.get("/reports/appointments-vaccination-stats");
            set({ vaccinationRate: res.data });
        } catch (error) {
            toast.error("Unable to get vaccination rate data");
            console.error(error);
        } finally {
            set({ isLoadingRate: false });
        }
    },

    //  Thống kê mũi trong tháng
    getMonthlyStats: async () => {
        set({ isLoadingMonthly: true });
        try {
            const res = await axiosInstance.get("/reports/appointments-vaccination-monthly-stats");
            set({ monthlyStats: res.data });
        } catch (error) {
            toast.error("Unable to get monthly data");
            console.error(error);
        } finally {
            set({ isLoadingMonthly: false });
        }
    },

    //  Tồn kho vaccine (có tìm kiếm + lọc)
    getInventory: async (params) => { 
        try {            
            const res = await axiosInstance.get("/reports/inventory", { params });
            
            set({ 
                inventory: res.data.data, 
                totalPages: res.data.pagination.totalPages 
            });
        } catch (error) {
            toast.error("Unable to get inventory data");
            console.error(error);
        } finally {
            set({ isLoadingInventory: false });
        }
    },

    //  Thống kê mũi tiêm theo thời gian
    getVaccinationStats: async (params) => {
        set({ isLoadingVaccinationStats: true });
        try {
            const res = await axiosInstance.get("/reports/vaccinations", { params });
            // Cấu trúc trả về mới: { data: [...], pagination: {...} }
            set({ 
                vaccinationStats: res.data.data,
                totalVaccinationPages: res.data.pagination.totalPages
            });
        } catch (error) {
            toast.error("Unable to get injection statistics");
            console.error(error);
        } finally {
            set({ isLoadingVaccinationStats: false });
        }
    },

   //  Thống kê mũi tiêm theo thời gian limit 10
 	getVaccinationStatsLimit10: async () => {
        try {
            const res = await axiosInstance.get("/reports/vaccinations-limit-10"); // URL API của bạn
            
            // 2. LẤY ĐÚNG DỮ LIỆU
            // Backend trả về { data: [...] } nên phải lấy res.data.data
            set({ vaccinationStatsLimit10: res.data.data }); 
            
        } catch (error) {
            console.error("Error fetching top 10 stats:", error);
            // Nếu lỗi, set lại về mảng rỗng để không crash trang
            set({ vaccinationStatsLimit10: [] }); 
        }
    },

    // Tổng công dân
    getTotalCitizens: async () => {
        set({ isLoadingTotalCitizens: true });
        try {
            const res = await axiosInstance.get("/reports/total-citizens");
            set({ totalCitizens: res.data.totalCitizens });
        } catch (error) {
            toast.error("Unable to get total citizens");
            console.error(error);
        } finally {
            set({ isLoadingTotalCitizens: false });
        }
    },
	
	updateInventoryItem: (updatedItem) => {
        set((state) => ({
            inventory: state.inventory.map((item) => 
                item.id === updatedItem.id ? { ...item, ...updatedItem } : item
            )
        }));
    },
}));
