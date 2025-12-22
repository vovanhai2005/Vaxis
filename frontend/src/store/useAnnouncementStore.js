import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import toast from 'react-hot-toast'

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  selectedAnnouncement: null,
  isLoading: false,
  isCreating: false,

  // Get all announcements
  getAnnouncements: async (filters = {}) => {
    set({ isLoading: true })
    try {
      const params = new URLSearchParams(filters).toString()
      const res = await axiosInstance.get(`/announcements${params ? `?${params}` : ''}`)
      set({ announcements: res.data })
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error(error.response?.data?.message || 'Failed to load announcements')
    } finally {
      set({ isLoading: false })
    }
  },

  // Get announcement by ID
  getAnnouncementById: async (id) => {
    set({ isLoading: true })
    try {
      const res = await axiosInstance.get(`/announcements/${id}`)
      set({ selectedAnnouncement: res.data })
      return res.data
    } catch (error) {
      console.error('Error fetching announcement:', error)
      toast.error(error.response?.data?.message || 'Failed to load announcement')
    } finally {
      set({ isLoading: false })
    }
  },

  // Create announcement (Manager only)
  createAnnouncement: async (announcementData) => {
    set({ isCreating: true })
    try {
      const res = await axiosInstance.post('/announcements', announcementData)
      toast.success('Announcement created successfully')
      get().getAnnouncements()
      return res.data
    } catch (error) {
      console.error('Error creating announcement:', error)
      toast.error(error.response?.data?.message || 'Failed to create announcement')
      throw error
    } finally {
      set({ isCreating: false })
    }
  },

  // Update announcement (Manager only)
  updateAnnouncement: async (id, announcementData) => {
    try {
      const res = await axiosInstance.put(`/announcements/${id}`, announcementData)
      toast.success('Announcement updated successfully')
      get().getAnnouncements()
      return res.data
    } catch (error) {
      console.error('Error updating announcement:', error)
      toast.error(error.response?.data?.message || 'Failed to update announcement')
      throw error
    }
  },

  // Delete announcement (Manager only)
  deleteAnnouncement: async (id) => {
    try {
      await axiosInstance.delete(`/announcements/${id}`)
      toast.success('Announcement deleted successfully')
      get().getAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error(error.response?.data?.message || 'Failed to delete announcement')
      throw error
    }
  },

  // Clear selected announcement
  clearSelectedAnnouncement: () => {
    set({ selectedAnnouncement: null })
  }
}))
