'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore, useContactStore, useAllContactsStore, getPhoneNumbersFromStore,
  getPhoneGroupsFromStore, getContactsForGroup,
  useCurrentPhoneNumberStore, CurrentSenderPhoneNumberState } from '@/lib/store/chatStore'; // Example of Zustand global store
import { ChatStore, ContactStore, AllContactsStore } from '@/lib/store/chatStore';
import { civicinfo } from 'googleapis/build/src/apis/civicinfo';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { useTranslations, useLocale } from 'next-intl';

// Define a type for the contact
interface Contact {
  id: string;
  name: string;
  // Add other properties if needed
}

const Sidebar = () => {
  const router = useRouter();
  const t = useTranslations("waScreen");
  const currentLocale = useLocale();

  const senderPhoneNumber = useCurrentPhoneNumberStore(
    (state) => state.senderPhoneNumber
  );

  console.log("Sender phone number on Sidebar:", senderPhoneNumber);
  
  // States
  const [selectedPhone, setSelectedPhone] = useState(senderPhoneNumber);
  
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);


  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [phoneGroups, setPhoneGroups] = useState<any[]>([]);
  const [isContactsLoaded, setIsContactsLoaded] = useState(false);

  // Global state for storing chats
  const { setChats } = useChatStore() as ChatStore; // Type assertion
  const { setContacts } = useContactStore() as ContactStore; // Type assertion
  const { setAllContacts } = useAllContactsStore() as AllContactsStore; // Type assertion
  const { setSenderPhoneNumber } = useCurrentPhoneNumberStore() as CurrentSenderPhoneNumberState; // Type assertion
  

  const handlePhoneSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPhone(e.target.value);
    setSenderPhoneNumber(e.target.value);
  }

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
          

          console.log("Sender phone number on Sidebar:", senderPhoneNumber);
          if (!senderPhoneNumber) {
          setSelectedPhone(filteredPhoneData[0].phoneNumber); // Set the first phone number as the default
          setSenderPhoneNumber(filteredPhoneData[0].phoneNumber); // Set the first phone number as the default
          } else {
            setSelectedPhone(senderPhoneNumber);
            setSenderPhoneNumber(senderPhoneNumber); // Set the first phone number as the default
          }
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

        const { chats, contacts, all_contacts } = await response.json();
        

        

        setChats(chats); // Save chats to global state
        setContacts(contacts); // Save contacts to global state
        setAllContacts(all_contacts); // Save all contacts to global state

        // Update phone groups and mark contacts as loaded
        const groups = getPhoneGroupsFromStore();
    setPhoneGroups(groups);
    setIsContactsLoaded(true);
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
        alert(t("noPhoneNumbersSelectedForExport"));
        return;
      }
  
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
  
      toast.success(t("numbersExportedSuccessfully"));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t("failedToExportPhoneNumbers"));
    }
  };

  const handleExportCSV = async () => {
    try {
      if (selectedPhones.length === 0) {
        alert(t("noPhoneNumbersSelectedForExport"));
        return;
      }

      const csvContent = selectedPhones.map((element) => ({
        phone_number: element.split("--")[0].toString(),
        name: element.split("--")[1]
      }));

      const csv = Papa.unparse(csvContent);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "leads.csv");
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t("failedToExportPhoneNumbers"));
    }
  };
  

  return (
    <div style={{ padding: '1rem', backgroundColor: '#141c24' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t("chats")}</h2>

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
          {t("loading")}...
        </div>
      )}

      {/* Phone number dropdown */}
      {phoneNumbers.length > 0 ? <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="phoneSelect">
          {t("selectPhoneNumber")}:
        </label>
        <select
          id="phoneSelect"
          value={selectedPhone}
          onChange={(e) => handlePhoneSelect(e)}
          className="block w-full p-2 border border-gray-300 rounded-md text-black text-sm focus:ring-blue-500 focus:border-blue-500 mt-2"
          
        >
          {phoneNumbers.map((phoneObj: any, index: number) => (
            <option key={index} value={phoneObj.phoneNumber}
              className="text-gray-700 bg-white hover:bg-gray-100">
              {phoneObj.phoneNumber}
            </option>
          ))}
        </select>
      </div> : !loading && (
        <div className="text-xl mb-4">
          {t("noPhoneNumbersFound")}<br></br>
          {t("pleaseConnectYourPhoneNumber")}<br></br>
          {t("inThe")} <a href={`/${currentLocale}/accounts`}>{t("accounts")}</a> {t("page")}.<br></br><br></br>
        </div>
      )}

      {/* Selected phone numbers */}
      <div style={{ marginBottom: '1rem' }}>
  {isContactsLoaded ? (
  <select
  id="selectedPhoneNumbers"
  multiple
  value={selectedPhones} // Ensure state reflects selected items
  onChange={(e) => {
    const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);

    if (selectedValues.includes("select-all")) {
      // Select all phone numbers
      const allValues = getPhoneNumbersFromStore();
      setSelectedPhones(allValues); // Set state to select all
    } else {
      setSelectedPhones(selectedValues); // Select specific options
    }
  }}
  style={{
    padding: '5px',
    fontSize: '16px',
    width: '100%',
    height: '200px', // Adjusted height for better grouping visibility
    color: '#000000',
    marginTop: '8px'
  }}
>

  {phoneGroups.map((group) => (
    <optgroup label={group.name} key={group.name} style={{ fontWeight: 'bold' }}>
      <option
        value={`group-${group.name}`}
        style={{ fontWeight: 'bold', textDecoration: 'underline' }}
        onClick={() => {
          // Select all contacts in this group
          const groupContacts = getContactsForGroup(group);
          setSelectedPhones(groupContacts);
        }}
      >
        {t("selectAllIn")} {group.name}
      </option>
      {group.contacts.map((contact: Contact) => (
        (contact.id.split('@')[0].length <= 13 && !contact.id.split('@')[1].includes("g") && !phoneNumbers.some(phone => phone === contact.id.split('@')[0]) && contact.id.split('@')[0] !== selectedPhone) && <option
          key={contact.id}
          value={"+".concat(contact.id.split('@')[0]).concat("--").concat(contact.name).concat("--").concat(group.name)}
        >
          {"+".concat(contact.id.split('@')[0])}
        </option>
      ))}
    </optgroup>
  ))}
</select>
  ) : loading ? (
            <div>
              <img
                src="/spinner.gif"
                alt="Loading..."
                width="50"
                height="50"
                style={{
                  marginTop: 8,
                  marginBottom: 8
                }}
              />
            </div>
  ) : (
    null
  )}


        {phoneNumbers.length >= 1 && (
          <div className="flex flex-col gap-2">
            {/* <p className="mb-2">{t("exportPhoneNumbers")}:</p> */}

            <div className="flex flex-row gap-2">
              <button
                onClick={handleExport}
                disabled={selectedPhones.length === 0}
                className={`mt-2 px-4 py-2 rounded border-none ${selectedPhones.length === 0
                    ? 'bg-gray-300 cursor-not-allowed text-black rounded-full'
                    : 'bg-green-600 hover:bg-green-700 cursor-pointer rounded-full'
                  }`}
              >
                {t("exportToCrm")}
              </button>
              <button
                onClick={handleExportCSV}
                disabled={selectedPhones.length === 0}
                className={`mt-2 px-4 py-2 rounded border-none ${selectedPhones.length === 0
                    ? 'bg-gray-300 cursor-not-allowed text-black rounded-full'
                    : 'bg-green-600 hover:bg-green-700 cursor-pointer rounded-full'
                  }`}
              >
                {t("exportToCsv")}
              </button>
            </div>
          </div>
        )}

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
            onClick={() => router.push(`/${currentLocale}/whatsapp-screen/${chat.chatId}`)}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                flexShrink: 0
              }}
            ><img src="/static/default-icon.png" alt="User Icon" /></div>
            <span className='mx-2'>{chat.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
