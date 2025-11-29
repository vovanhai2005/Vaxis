import { create } from 'zustand'
import { axiosInstance } from '../lib/axios'
import toast from 'react-hot-toast'

export const useLookUpStore = create((set) => ({
  lookupResults: [],
  isLoading: false,

  lookupCitizen: async (nationalId) => {
    set({ isLoading: true })
    try {
      const res = await axiosInstance.get(`/administration/?nationalId=${nationalId}`)
      set({
        lookupResults: res.data,
      })
      toast.success("Seach completed")
    } catch (error) {
      toast.error("Error searching for citizen profile")
      set({ citizenProfile: null, vaccineHistory: [] })
    } finally {
      set({ isLoading: false })
    }
  }
}))
