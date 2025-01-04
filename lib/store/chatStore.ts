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

export type AllContactsStore = {
    setAllContacts: (all_contacts: any[]) => void; // Adjust the type as necessary
    all_contacts: any[]; // Adjust the type as necessary
  };

  export type CurrentSenderPhoneNumberState = {
    senderPhoneNumber: string;
    setSenderPhoneNumber: (value: string) => void;
  };
  
  export const useCurrentPhoneNumberStore = create<CurrentSenderPhoneNumberState>(
    (set) => ({
      senderPhoneNumber: "",
      setSenderPhoneNumber: (value: string) =>
        set({ senderPhoneNumber: value }),
    })
  );

export const useChatStore = create((set) => ({
  chats: [],
  setChats: (chats: any) => set({ chats } as any),
}));

export const useContactStore = create((set) => ({
  contacts: [],
  setContacts: (contacts: any) => set({ contacts } as any),
}));

export const useAllContactsStore = create((set) => ({
  all_contacts: [],
  setAllContacts: (all_contacts: any) => set({ all_contacts } as any),
}));




// Helper function to safely get contacts from the store
export const getPhoneNumbersFromStore = () => {
  const storeState = useAllContactsStore.getState();
  
  // Ensure the data is in the expected format before proceeding
  if (Array.isArray(storeState)) {
    return storeState.flatMap((group) =>
      group?.contacts
        ?.filter(
          (contact: any) =>
            contact.id.split('@')[0].length <= 12 &&
            !contact.id.split('@')[1].includes("g")
        )
        .map(
          (contact: any) => "+".concat(contact.id.split('@')[0]).concat("--").concat(contact.name)
        ) || []
    );
  }

  // Return an empty array if the store data isn't valid
  console.error('Expected array of groups but got:', storeState);
  return [];
};

// Helper function to safely get phone groups from the store
export const getPhoneGroupsFromStore = () => {
  const storeState : any = useAllContactsStore.getState();

  // Ensure the data is an array of groups
  if (Array.isArray(storeState.all_contacts)) {
    return storeState.all_contacts;
  }

  console.error('Expected array of groups but got:', storeState);
  return [];
};

// Helper function to get contacts for a specific group
export const getContactsForGroup = (group: any) => {
  return group?.contacts?.filter(
    (contact: any) =>
      contact.id.split('@')[0].length <= 13 &&
      !contact.id.split('@')[1].includes("g")
  ).map(
    (contact: any) => "+".concat(contact.id.split('@')[0]).concat("--").concat(contact.name).concat("--").concat(group.name)
  ) || [];
};


