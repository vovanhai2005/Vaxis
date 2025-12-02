import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'

export const useVaccineLotStore = create((set, get) => ({
    lots: [],
    expiringBatches: 0,
    totalStock: 0,
    isLoadingLots: false,
    isLoadingStats: false,

    // ================== expiringBatches Controller ==================
    getExpiringBatches: async () => {
        set({ isLoadingStats: true });
        try {
            const res = await axiosInstance.get('/vaccine-lots/expiring');
            set({ expiringBatches: res.data.expiringBatches });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load expiring batches');
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
            toast.error(error.response?.data?.message || 'Failed to load total stock');
        } finally {
            set({ isLoadingStats: false });
        }
    },

    // ================== addLot Controller ==================
    addLot: async (data) => {
        try {
            await axiosInstance.post('/vaccine-lots', data);
            toast.success('Lot added successfully');

            // refresh data
            get().getVaccineLots();
            get().totalStockController();
            get().expiringBatchesController();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add lot');
        }
    },

    // ================== editLot Controller ==================
    editLot: async (id, data) => {
        try {
            await axiosInstance.put(`/vaccine-lots/${id}`, data);
            toast.success('Lot updated');

            // refresh data
            get().getVaccineLots();
            get().totalStockController();
            get().expiringBatchesController();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update lot');
        }
    },

    // ================== deleteLot Controller ==================
    deleteLot: async (id) => {
        try {
            await axiosInstance.delete(`/vaccine-lots/${id}`);
            toast.success('Lot deleted');

            // refresh data
            get().getVaccineLots();
            get().totalStockController();
            get().expiringBatchesController();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete lot');
        }
    }
}));
