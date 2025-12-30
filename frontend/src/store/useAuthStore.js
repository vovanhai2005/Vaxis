import {create} from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

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
        } catch (error) {
            set({ authUser: null });
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

    login: async (data) => {
        set ({isLoggingIn: true})
        try {
            const res = await axiosInstance.post("/auth/login", data);
            if (res && res.data) {
                set({ authUser: res.data });
                toast.success("Logged in successfully");

                window.location.href = '/';
            }
        } catch (error) {
            console.error("Login error:", error);
            
            if (error.response) {
                if (error.response.status === 400) {
                    toast.error(error.response.data.message || "Invalid login information");
                } else if (error.response.status === 401) {
                    toast.error("Invalid credentials");
                } else {
                    toast.error(error.response.data.message || "Login failed");
                }
            } else {
                toast.error("Network error. Please check your connection.");
            }
            
            set({ authUser: null });
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            window.location.href = '/login';
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Logout failed. Please try again.");
        } finally {
            set({ isSigningUp: false, isLoggingIn: false });
        }
    }

}));