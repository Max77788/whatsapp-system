'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore, useContactStore } from '@/lib/store/chatStore'; // Example of Zustand global store
import { ChatStore, ContactStore } from '@/lib/store/chatStore';
import { civicinfo } from 'googleapis/build/src/apis/civicinfo';
import { toast } from 'react-toastify';

const Sidebar = () => {
  const router = useRouter();

  // States
  const [selectedPhone, setSelectedPhone] = useState('');
  
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);


  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Global state for storing chats
  const { setChats } = useChatStore() as ChatStore; // Type assertion
  const { setContacts } = useContactStore() as ContactStore; // Type assertion
  // Fetch phone numbers on component mount
  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/phone-numbers');
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const phoneData = await response.json();
        const filteredPhoneData = phoneData.filter((item: any) => item.active);

        if (filteredPhoneData.length > 0) {
          setPhoneNumbers(filteredPhoneData);
          setSelectedPhone(filteredPhoneData[0].phoneNumber); // Set the first phone number as the default
        } else {
          throw new Error('No active phone numbers found.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneNumbers();
  }, []);

  // Fetch chats for the selected phone number
  useEffect(() => {
    const fetchChats = async () => {
      if (!selectedPhone) return;

      try {
        setLoading(true);
        const response = await fetch('/api/whatsapp-part/get-chats-of-number', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: selectedPhone }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const { chats, contacts } = await response.json();
        setChats(chats); // Save chats to global state
        setContacts(contacts); // Save contacts to global state
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [selectedPhone]);


  const handleExport = async () => {
    try {
      if (selectedPhones.length === 0) {
        alert('No phone numbers selected for export.');
        return;
      }

      console.log(`Selected phones: ${selectedPhones}`);
  
      const response = await fetch('/api/leads/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumbersList: selectedPhones }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      toast.success('Numbers exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export phone numbers.');
    }
  };
  

  return (
    <div style={{ padding: '1rem', backgroundColor: '#141c24' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Chats</h2>

      {/* Error message 
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          Please connect your phone number in the settings page.
        </div>
      )}
        */}

      {/* Loading indicator */}
      {loading && (
        <div style={{ marginBottom: '1rem' }}>
          Loading...
        </div>
      )}

      {/* Phone number dropdown */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="phoneSelect" style={{ marginRight: '10px' }}>
          Select Phone Number:
        </label>
        <select
          id="phoneSelect"
          value={selectedPhone}
          onChange={(e) => setSelectedPhone(e.target.value)}
          style={{ padding: '5px', fontSize: '16px', color: '#000000' }}
        >
          {phoneNumbers.map((phoneObj: any, index: number) => (
            <option key={index} value={phoneObj.phoneNumber}>
              {phoneObj.phoneNumber}
            </option>
          ))}
        </select>
      </div>

      {/* Selected phone numbers */}
      <div style={{ marginBottom: '1rem' }}>
  <p>Export Phone Numbers:</p>
  <select
    id="selectedPhoneNumbers"
    multiple
    value={selectedPhones} // Ensure state reflects selected items
    onChange={(e) => {
      const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);

      console.log(selectedValues);

      if (selectedValues.includes("select-all")) {
        // Select all phone numbers
        const allValues = (useContactStore.getState() as { contacts: { id: string; name: string }[] }).contacts
          .filter((contact: any) => contact.id.split('@')[0] !== selectedPhone.split('@')[0] && !contact.id.split('@')[1].includes("g") && contact.id.split('@')[0].length <= 12)
          .map((contact: any) => "+".concat(contact.id.split('@')[0]).concat("--").concat(contact.name));

        setSelectedPhones(allValues); // Set state to select all
      } else {
        setSelectedPhones(selectedValues); // Select specific options
      }
    }}
    style={{
      padding: '5px',
      fontSize: '16px',
      width: '100%',
      height: '100px',
      color: '#000000',
    }}
  >
    {/* Add "Select All" option */}
    <option value="select-all" style={{ fontWeight: 'bold' }}>
      Select All
    </option>
    {(useContactStore.getState() as { contacts: { id: string; name: string }[] }).contacts
      .filter((contact: any) => contact.id.split('@')[0] !== selectedPhone.split('@')[0] && !contact.id.split('@')[1].includes("g") && contact.id.split('@')[0].length <= 13)
      .map((contact: any) => (
        <option key={contact.id} value={"+".concat(contact.id.split('@')[0]).concat("--").concat(contact.name)}>
          {"+".concat(contact.id).split('@')[0]}
        </option>
            ))} 
  </select>
  <button
    onClick={handleExport}
    disabled={selectedPhones.length === 0}
    className={`mt-2 px-4 py-2 rounded border-none ${
      selectedPhones.length === 0 ? 'bg-gray-300 cursor-not-allowed text-black rounded-full' : 'bg-green-600 hover:bg-green-700 cursor-pointer rounded-full'
    }`}
  >
    Export
  </button>
</div>


      {/* Chat list */}
      <ul style={{ listStyle: 'none', padding: '0' }}>
        {(useChatStore.getState() as { chats: { chatId: string; name: string }[] }).chats.map((chat: any) => (
          <li
            key={chat.chatId}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 5px',
              cursor: 'pointer',
              borderBottom: '1px solid #ddd',
            }}
            onClick={() => router.push(`/whatsapp-screen/${chat.chatId}`)}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                marginRight: '10px',
                flexShrink: 0
              }}
            ><img src="/static/default-icon.png" alt="User Icon" /></div>
            <span>{chat.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
