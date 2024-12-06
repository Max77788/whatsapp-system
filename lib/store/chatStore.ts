// store/chatStore.js
import { create } from 'zustand';

// Define the type for your chat store
export type ChatStore = {
    setChats: (chats: any[]) => void; // Adjust the type as necessary
    chats: any[]; // Adjust the type as necessary
  };

export type ContactStore = {
    setContacts: (contacts: any[]) => void; // Adjust the type as necessary
    contacts: any[]; // Adjust the type as necessary
  };

export const useChatStore = create((set) => ({
  chats: [],
  setChats: (chats: any) => set({ chats } as any),
}));

export const useContactStore = create((set) => ({
  contacts: [],
  setContacts: (contacts: any) => set({ contacts } as any),
}));
