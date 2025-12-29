import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'

export const useStaffStore = create((set, get) => ({
    staffList: [],
    isLoadingStaff: false,

    // ================== getStaffList Controller ==================
    getStaffList: async () => {
        set({ isLoadingStaff: true });
        try {
          const res = await axiosInstance.get('/staff/list');
		  console.log("Dữ liệu API trả về:", res.data);
        set({ staffList: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch staff list');
        } finally {
            set({ isLoadingStaff: false });
        }
    },

    // ================== createEmployee Controller ==================
    createEmployee: async (data) => {
        set({ isLoadingStaff: true });
        try {
            await axiosInstance.post('/staff/create', data);
            toast.success('Employee created successfully');

            // Refresh data ngay sau khi tạo thành công
            get().getStaffList();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create employee');
        } finally {
            set({ isLoadingStaff: false });
        }
    },

    // ================== updateEmployeeProfile Controller ==================
    updateEmployeeProfile: async (id, data) => {
        set({ isLoadingStaff: true });
        try {
            await axiosInstance.put(`/staff/update/${id}`, data);
            toast.success('Employee profile updated successfully');

            // Refresh data
            get().getStaffList();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            set({ isLoadingStaff: false });
        }
    },

    // ================== deleteEmployee Controller ==================
    deleteEmployee: async (id) => {
        set({ isLoadingStaff: true });
        try {
            await axiosInstance.put(`/staff/delete/${id}`);
            toast.success('Employee deleted successfully');

            // Refresh data
            get().getStaffList();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete employee');
        } finally {
            set({ isLoadingStaff: false });
        }
    },
	
	restoreEmployee: async (id) => {
    set({ isLoadingStaff: true });
    try {
        // Gọi API xuống backend (đường dẫn tùy thuộc vào bạn define ở router)
        await axiosInstance.put(`/staff/restore/${id}`);

        // Cập nhật lại state local: Tìm nhân viên đó và set active = true
        set((state) => ({
            staffList: state.staffList.map((emp) => 
                emp.id === id ? { ...emp, active: true } : emp
            ),
            isLoadingStaff: false,
        }));
        //get().getStaffList();
        toast.success("Employee restored successfully");
    } catch (error) {
        set({ isLoadingStaff: false });
        toast.error(error.response?.data?.message || "Failed to restore employee");
        console.log("Error restoring staff:", error);
    }
  }
}));