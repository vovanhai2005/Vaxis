import {create} from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:8000" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],

    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket();
        } catch (error) {
            console.log("Error in checkAuth:", error);
            if (error.response && error.response.status === 401) {
                set({ authUser: null });
            } else if (!error.message.includes('Network Error')) {
                console.error("Auth check failed:", error);
                set({ authUser: null });
            }
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            if (res && res.data) {
                set({ authUser: res.data });
                toast.success("Account created successfully");
                get().connectSocket();  

                window.location.href = '/';
            }
        } catch (error) {
            console.error("Signup error:", error);
            const errorMessage = error.response?.data?.message || 
                               "Network error. Please check if the server is running.";
            toast.error(errorMessage);
            set({ authUser: null });
        } finally {
            set({ isSigningUp: false });
        }
    },

}));