import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import toast from 'react-hot-toast'
import { useVaccineStore } from './useVaccineStore.js'

export const useAppointmentStore = create((set, get) => ({
    appointments: [],
	totalCompleted: 0,
    isLoadingAppointments: false,
	upcomingList: [], 
	isLoadingStats: false,
    isLoadingUpcoming: false,
    // Make an appointment
    makeAppointment: async (scheduledAt, notes) => {
        const { selectedVaccines } = useVaccineStore.getState()
        if (selectedVaccines.length === 0) {
            toast.error('No vaccines selected for appointment')
            return
        }   

        if (!scheduledAt) {
            toast.error('Please select an appointment date and time')
            return
        }

        try {
            const vaccineIds = selectedVaccines.map(v => v.id)
            const res = await axiosInstance.post('/appointments', {
                scheduled_at: scheduledAt,
                notes,
                vaccineIds
            })
            toast.success('Appointment made successfully')
            // Clear cart after successful appointment
            useVaccineStore.getState().clearCart();
        } catch (error) {
            console.error('Error making appointment:', error)
            toast.error(error.response?.data?.message || 'Failed to make appointment')
        }
    },
    
    // Get appointments for citizen
    getCitizenAppointments: async () => {
        set({ isLoadingAppointments: true })
        try {
            const res = await axiosInstance.get('/appointments/me')
            set({ appointments: res.data })
        } catch (error) {
            console.error('Error fetching appointments:', error)
            toast.error(error.response?.data?.message || 'Failed to load appointments')
        } finally {
            set({ isLoadingAppointments: false })
        }
    },

    deleteAppointment : async (appointmentId) => {
        try {
            await axiosInstance.delete(`/appointments/${appointmentId}`);
            toast.success('Appointment cancelled successfully');
            // Refresh appointments after deletion
            get().getCitizenAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel appointment');
        }
    },

    editAppointment: async (appointmentId, scheduledAt, notes) => {
        try {
            await axiosInstance.put(`/appointments/${appointmentId}`, {
                scheduled_at: scheduledAt,
                notes: notes
            });
            toast.success('Appointment updated successfully');
            // Refresh appointments after editing
            get().getCitizenAppointments();
        }
        catch (error) {
            console.error('Error updating appointment:', error);
            toast.error(error.response?.data?.message || 'Failed to update appointment');
        }
    },

	getTotalCompleted: async () => {
        set({ isLoadingStats: true });
        try {
            const res = await axiosInstance.get('/appointments/total-completed'); 
            set({ totalCompleted: res.data.totalCompleted });
        } catch (error) {
            console.error('Error fetching total completed stats:', error);
            toast.error(error.response?.data?.message || 'Failed to get total Injections');
        } finally {
            set({ isLoadingStats: false });
        }
    },

	getUpcomingAppointments: async () => {
        set({ isLoadingUpcoming: true });
        try {
            const res = await axiosInstance.get('/appointments/upcoming');
            set({ upcomingList: res.data });
        } catch (error) {
            console.error('Error fetching upcoming appointments:', error);
			toast.error(error.response?.data?.message || 'Failed to get upcoming appointments');
        } finally {
            set({ isLoadingUpcoming: false });
        }
    }
}))