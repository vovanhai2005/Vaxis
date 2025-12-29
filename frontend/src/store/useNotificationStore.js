import { create } from 'zustand'
import { axiosInstance } from '../lib/axios.js'
import toast from 'react-hot-toast'
import { 
  connectSocket, 
  disconnectSocket, 
  onNewNotification, 
  onNotificationRead, 
  onNotificationReadAll, 
  onNotificationDeleted,
  removeNotificationListeners 
} from '../lib/socket.js'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  stats: null,
  isLoading: false,
  isSocketConnected: false,

  // Initialize socket connection
  initSocket: (userId) => {
    if (!get().isSocketConnected && userId) {
      const socket = connectSocket(userId);
      
      // Set up listeners - these will work once socket connects
      const setupListeners = () => {
        // Listen for new notifications
        onNewNotification((notification) => {
          console.log('Received new notification:', notification);
          set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
          }));
          
          // Show toast notification
          toast.success(`New notification: ${notification.title}`);
        });

        // Listen for notification read
        onNotificationRead((data) => {
          set((state) => ({
            notifications: state.notifications.map((notif) =>
              notif.id === data.notificationId ? { ...notif, is_read: true } : notif
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
        });

        // Listen for all notifications read
        onNotificationReadAll(() => {
          set((state) => ({
            notifications: state.notifications.map((notif) => ({ ...notif, is_read: true })),
            unreadCount: 0
          }));
        });

        // Listen for notification deleted
        onNotificationDeleted((data) => {
          set((state) => {
            const deletedNotif = state.notifications.find((n) => n.id === data.notificationId);
            return {
              notifications: state.notifications.filter((notif) => notif.id !== data.notificationId),
              unreadCount: deletedNotif && !deletedNotif.is_read 
                ? Math.max(0, state.unreadCount - 1) 
                : state.unreadCount
            };
          });
        });
      };

      // Set up listeners immediately (they'll queue until connected)
      setupListeners();

      set({ isSocketConnected: true });
    }
  },

  // Disconnect socket
  disconnectSocket: (userId) => {
    if (get().isSocketConnected) {
      disconnectSocket(userId);
      removeNotificationListeners();
      set({ isSocketConnected: false });
    }
  },

  // Get user's notifications
  getNotifications: async (filters = {}) => {
    set({ isLoading: true })
    try {
      const params = new URLSearchParams(filters).toString()
      const res = await axiosInstance.get(`/notifications${params ? `?${params}` : ''}`)
      set({ notifications: res.data })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error(error.response?.data?.message || 'Failed to load notifications')
    } finally {
      set({ isLoading: false })
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const res = await axiosInstance.get('/notifications/unread-count')
      set({ unreadCount: res.data.unread_count })
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  },

  // Get notification stats
  getNotificationStats: async () => {
    try {
      const res = await axiosInstance.get('/notifications/stats')
      set({ stats: res.data })
    } catch (error) {
      console.error('Error fetching notification stats:', error)
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`)
      // Socket event will handle state update to avoid double decrement
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error(error.response?.data?.message || 'Failed to mark as read')
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      await axiosInstance.put('/notifications/read-all')
      // Socket event will handle state update to avoid double decrement
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error(error.response?.data?.message || 'Failed to mark all as read')
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`)
      // Socket event will handle state update to avoid double decrement
      toast.success('Notification deleted')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error(error.response?.data?.message || 'Failed to delete notification')
    }
  },

  // Refresh notifications
  refreshNotifications: async () => {
    await Promise.all([
      get().getNotifications(),
      get().getUnreadCount()
    ])
  }
}))
