import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import toast from 'react-hot-toast'

export const useUserStore = create((set) => ({
    userProfile: null,
    vaccineHistory: [],
    notifications: [],
    isLoadingProfile: false,
    isUpdatingProfile: false,
    isLoadingHistory: false,
    isLoadingNotifications: false,

    // Get citizen profile
    getCitizenProfile: async () => {
        set({ isLoadingProfile: true })
        try {
            const res = await axiosInstance.get('/users/me')
            set({ userProfile: res.data })
        } catch (error) {
            console.error('Error fetching profile:', error)
            toast.error(error.response?.data?.message || 'Failed to load profile')
        } finally {
            set({ isLoadingProfile: false })
        }
    },

    // Update citizen profile
    updateCitizenProfile: async (profileData) => {
        set({ isUpdatingProfile: true })
        try {
            const res = await axiosInstance.put('/users/me', profileData)
            toast.success('Profile updated successfully')
            // Refresh profile after update
            const updatedProfile = await axiosInstance.get('/users/me')
            set({ userProfile: updatedProfile.data })
            return true
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error(error.response?.data?.message || 'Failed to update profile')
            return false
        } finally {
            set({ isUpdatingProfile: false })
        }
    },

    // Get vaccine history
    getVaccineHistory: async () => {
        set({ isLoadingHistory: true })
        try {
            const res = await axiosInstance.get('/users/me/vaccine-history')
            set({ vaccineHistory: res.data })
        } catch (error) {
            console.error('Error fetching vaccine history:', error)
            toast.error(error.response?.data?.message || 'Failed to load vaccine history')
        } finally {
            set({ isLoadingHistory: false })
        }
    },

    // Get notifications
    getNotifications: async () => {
        set({ isLoadingNotifications: true })
        try {
            const res = await axiosInstance.get('/users/me/notifications')
            set({ notifications: res.data })
        } catch (error) {
            console.error('Error fetching notifications:', error)
            toast.error(error.response?.data?.message || 'Failed to load notifications')
        } finally {
            set({ isLoadingNotifications: false })
        }
    },

    // Clear user data (useful for logout)
    clearUserData: () => {
        set({
            userProfile: null,
            vaccineHistory: [],
            notifications: []
        })
    }
}))