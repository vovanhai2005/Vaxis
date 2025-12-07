import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'

export const useVaccineLotStore = create((set, get) => ({
    lots: [],
    expiringBatches: 0,
    totalStock: 0,
    isLoadingLots: false,
    isLoadingStats: false,

    getLotById: async (id) => {
        set({ isLoadingLots: true });
        try {
            const res = await axiosInstance.get(`/vaccine-lots/${id}`);
			console.log("Dữ liệu Lot nhận được:", res.data);
            return res.data; 
        } catch (error) {
            console.error('Error fetching lot details:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch lot details');
            return null;
        } finally {
            set({ isLoadingLots: false });
        }	    
    },	
	
    getVaccineLots: async () => {
        set({ isLoadingLots: true });
        try {
            // Đảm bảo đường dẫn API đúng (ví dụ: GET /vaccine-lots)
            const res = await axiosInstance.get('/vaccine-lots');
            set({ lots: res.data });
        } catch (error) {
            console.error('Error fetching lots:', error);
        } finally {
            set({ isLoadingLots: false });
        }
    },

    // ================== expiringBatches Controller ==================
    getExpiringBatches: async () => {
        set({ isLoadingStats: true });
        try {
            const res = await axiosInstance.get('/vaccine-lots/expiring');
            set({ expiringBatches: res.data.expiringBatches });
        } catch (error) {
            // Không toast lỗi ở đây để tránh spam thông báo nếu api ngầm lỗi
            console.error('Failed to load expiring batches', error);
        } finally {
            set({ isLoadingStats: false });
        }
    },

    // ================== totalStock Controller ==================
    getTotalStock: async () => {
        set({ isLoadingStats: true });
        try {
            const res = await axiosInstance.get('/vaccine-lots/total-stock');
            set({ totalStock: res.data.totalStock });
        } catch (error) {
            console.error('Failed to load total stock', error);
        } finally {
            set({ isLoadingStats: false });
        }
    },

    // ================== addLot Controller ==================
    addLot: async (data) => {
       
        try {
            
            await axiosInstance.post('/vaccine-lots', data);
            toast.success('Lot added successfully');
        } catch (error) {
            
            toast.error(error.response?.data?.error || 'Failed to add lot');
            throw error; // Dừng hàm tại đây
        }
    },

    // ================== editLot Controller ==================
    editLot: async (id, data) => {
        try {
           const res = await axiosInstance.put(`/vaccine-lots/${id}`, data);
            toast.success('Lot updated');
			return res.data;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update lot');
            throw error;
        }

        // Refresh data safely
       /* try {
            get().getVaccineLots();
            get().getTotalStock();
            get().getExpiringBatches();
        } catch(e) { console.error(e) }*/
    },

    // ================== deleteLot Controller ==================
    deleteLot: async (id) => {
        try {
            await axiosInstance.delete(`/vaccine-lots/${id}`);
            toast.success('Lot deleted');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete lot');
            throw error;
        }
    }
}));