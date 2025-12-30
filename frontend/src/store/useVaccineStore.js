import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import toast from 'react-hot-toast'

export const useVaccineStore = create((set, get) => ({
    vaccines: [],
    isLoadingVaccines: false,
    isAddingVaccine: false,
    isEditingVaccine: false,
    isDeletingVaccine: false,
    selectedVaccines: [],
    totalCost: 0,

    // Add vaccines to cart
    addVaccineToCart: (vaccine) => {
        const { selectedVaccines } = get()
        const isAlreadyAdded = selectedVaccines.some(v => v.id === vaccine.id)

        if (isAlreadyAdded) {
            toast.error('Vaccine already in cart')
            return
        }

        const newSelectedVaccines = [...selectedVaccines, vaccine]
        const newTotalCost = newSelectedVaccines.reduce((total, v) => total + parseFloat(v.price), 0)

        set({
            selectedVaccines: newSelectedVaccines,
            totalCost: newTotalCost
        })
        toast.success(`${vaccine.name} added to cart`)
    },

    // Remove vaccines from cart
    removeVaccineFromCart: (vaccineId) => {
        const { selectedVaccines } = get()
        const newSelectedVaccines = selectedVaccines.filter(v => v.id !== vaccineId)
        const newTotalCost = newSelectedVaccines.reduce((total, v) => total + parseFloat(v.price), 0)

        set({
            selectedVaccines: newSelectedVaccines,
            totalCost: newTotalCost
        })
        toast.success('Vaccine removed from cart')
    },

    // Clear the cart
    clearCart: () => {
        set({ selectedVaccines: [], totalCost: 0 })
    },

    // Fetch all vaccines
    getVaccines: async () => {
        set({ isLoadingVaccines: true })
        try {
            const res = await axiosInstance.get('/vaccines')
            set({ vaccines: res.data })
        } catch (error) {
            console.error('Error fetching vaccines:', error)
            toast.error(error.response?.data?.message || 'Failed to load vaccines')
        } finally {
            set({ isLoadingVaccines: false })
        }
    },

    // Get vaccine by ID
    getVaccineByID: async (id) => {
        try {
            const res = await axiosInstance.get(`/vaccines/${id}`)
            return res.data
        } catch (error) {
            console.error('Error fetching vaccine by ID:', error)
            toast.error(error.response?.data?.message || 'Failed to load vaccine details')
            return null
        }
    },

    // Add a new vaccine
    addVaccine: async (vaccineData) => {
        set({ isAddingVaccine: true })
        try {
            const res = await axiosInstance.post('/vaccines', vaccineData)
            toast.success('Vaccine added successfully')
            // Refresh vaccine list after adding
            const updatedRes = await axiosInstance.get('/vaccines')
            set({ vaccines: updatedRes.data })
        } catch (error) {
            console.error('Error adding vaccine:', error)
            toast.error(error.response?.data?.message || 'Failed to add vaccine')
        } finally {
            set({ isAddingVaccine: false })
        }
    },

    // Edit existing vaccine
    editVaccine: async (id, vaccineData) => {
        set({ isEditingVaccine: true })
        try {
            await axiosInstance.put(`/vaccines/${id}`, vaccineData)
            toast.success('Vaccine updated successfully')
            // Refresh vaccine list after editing
            const updatedRes = await axiosInstance.get('/vaccines')
            set({ vaccines: updatedRes.data })
        } catch (error) {
            console.error('Error editing vaccine:', error)
            toast.error(error.response?.data?.message || 'Failed to update vaccine')
        } finally {
            set({ isEditingVaccine: false })
        }
    },

    // Delete a vaccine
    deleteVaccine: async(id) => {
        set({ isDeletingVaccine: true })
        try {
            await axiosInstance.put(`/vaccines/delete/${id}`)
            toast.success('Vaccine deleted successfully')
            // Refresh vaccine list after deleting
            const updatedRes = await axiosInstance.get('/vaccines')
            set({ vaccines: updatedRes.data })
        } catch (error) {
            console.error('Error deleting vaccine:', error)
            toast.error(error.response?.data?.message || 'Failed to delete vaccine')
        } finally {
            set({ isDeletingVaccine: false })
        }
    }
}))