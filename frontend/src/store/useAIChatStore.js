import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useAIChatStore = create((set, get) => ({
  messages: [],
  conversationHistory: [],
  isLoading: false,

  sendMessage: async (userMessage) => {
    set({ isLoading: true });
    
    // Add user message to UI immediately
    const userMsg = { role: 'user', content: userMessage, timestamp: new Date() };
    set(state => ({ messages: [...state.messages, userMsg] }));

    try {
      const res = await axiosInstance.post('/ai/chat', {
        message: userMessage,
        conversationHistory: get().conversationHistory
      });

      const aiMsg = { 
        role: 'assistant', 
        
        content: res.data.response, 
        timestamp: new Date() 
      };

      set(state => ({
        messages: [...state.messages, aiMsg],
        conversationHistory: res.data.conversationHistory
      }));
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from AI');
      
      // Remove the user message if request failed
      set(state => ({
        messages: state.messages.slice(0, -1)
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  clearChat: () => {
    set({ messages: [], conversationHistory: [] });
  }
}));
