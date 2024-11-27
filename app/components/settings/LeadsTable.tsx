"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { useSession } from "next-auth/react";



interface Lead {
  name: string;
  phone_number: string;
  source: string;
  sent_messages?: number; // Optional in case it's not always present
}

interface Props {
  leads?: Lead[]; // Prop to accept initial leads data
}

const LeadsTable: React.FC<Props> = ({ leads = [] }) => {
  const [leadData, setLeadData] = useState<Lead[]>(leads);
  const [loading, setLoading] = useState(leads.length === 0);
  const [newLead, setNewLead] = useState<Lead>({
    name: "",
    phone_number: "",
    source: "",
    sent_messages: 0,
  });
  const [bulkPhoneNumbers, setBulkPhoneNumbers] = useState<string>("");


  const { data: session } = useSession();

  

  useEffect(() => {
    if (leads.length === 0) {
      const fetchData = async () => {
        try {
          const response = await fetch("/api/leads");
          const data: Lead[] = await response.json();
          setLeadData(data.map(lead => ({ ...lead, sent_messages: lead.sent_messages || 0 }))); // Ensure `sent_messages` defaults to 0
        } catch (error) {
          console.error("Failed to fetch leads:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [leads]);

  const handleAddLead = () => {
    if (!newLead.name || !newLead.phone_number || !newLead.source) {
      alert("Please fill in all fields before adding a lead.");
      return;
    }

    setLeadData((prevData) => [...prevData, newLead]);
    setNewLead({ name: "", phone_number: "", source: "", sent_messages: 0 });
  };

  const handleBulkAdd = () => {
    if (!bulkPhoneNumbers.trim()) {
      alert("Please paste some phone numbers.");
      return;
    }
  
    const phoneNumbers = bulkPhoneNumbers
      .split(/[\n,]+/) // Split by new lines or commas
      .map((number) => number.trim()) // Remove whitespace
      .filter((number) => number); // Remove empty entries
  
    if (phoneNumbers.length === 0) {
      alert("No valid phone numbers found.");
      return;
    }
  
    const newLeads = phoneNumbers.map((phone_number) => ({
      name: "", // Default name
      phone_number,
      source: "", // Default source
      sent_messages: 0, // Default sent messages
    }));
  
    setLeadData((prevData) => [...prevData, ...newLeads]);
    setBulkPhoneNumbers(""); // Clear the text area
    alert(`${newLeads.length} phone numbers added successfully!`);
  };
  

  const handleImportLeads = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const extension = file.name.split(".").pop()?.toLowerCase();
  
    if (extension === "json") {
      // Handle JSON files
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const importedLeads: Lead[] = JSON.parse(reader.result as string);
          const formattedLeads = importedLeads.map((lead) => ({
            ...lead,
            sent_messages: lead.sent_messages || 0, // Ensure `sent_messages` defaults to 0
          }));
          setLeadData((prevData) => [...prevData, ...formattedLeads]);
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("Failed to import leads. Please check the file format.");
        }
      };
      reader.readAsText(file);
    } else if (extension === "csv") {
      // Handle CSV files using Papaparse
      Papa.parse(file, {
        header: true, // Treat the first row as headers
        skipEmptyLines: true,
        complete: (results) => {
          const importedLeads = results.data as Lead[];
          const formattedLeads = importedLeads.map((lead) => ({
            ...lead,
            sent_messages: lead.sent_messages || 0, // Ensure `sent_messages` defaults to 0
          }));
          setLeadData((prevData) => [...prevData, ...formattedLeads]);
        },
        error: (error) => {
          console.error("Error parsing CSV file:", error);
          alert("Failed to import leads from CSV file. Please check the file format.");
        },
      });
    } else {
      alert("Unsupported file type. Please upload a JSON or CSV file.");
    }
  };

  const handleDeleteLead = (index: number) => {
      setLeadData((prevData) => prevData.filter((_, i) => i !== index));
  };
  

  const saveData = async () => {
    try {
        const userEmail = session?.user?.email;
        if (!userEmail) {
            alert("User email not found.");
            return;
        }
      
        const leadsToSave = leadData.map(({ name, phone_number, source, sent_messages }) => ({
            name,
            phone_number,
            source,
            sent_messages
        }));

        const response = await fetch("/api/leads/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userEmail,
              leadsList: leadsToSave,
          })
        });

        if (response.ok) {
            alert("Leads data saved successfully!");
            location.reload();
        } else {
            alert("Failed to save leads data.");
        }
    } catch (error) {
        console.error("Error saving leads data:", error);
        alert("An error occurred while saving leads data.");
    }
};

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="mt-8 p-4">
      {leadData.length === 0 ? (
        <p>No leads available. Add some data.</p>
      ) : (
        <>
          <h1 className="text-2xl font-semibold mb-4">Leads Data</h1>
          <table className="min-w-full border border-gray-300 mb-4">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="border border-gray-300 p-2 text-left">Name</th>
                <th className="border border-gray-300 p-2 text-left">Phone Number</th>
                <th className="border border-gray-300 p-2 text-left">Source</th>
                <th className="border border-gray-300 p-2 text-left">Sent Messages</th>
              </tr>
            </thead>
            <tbody>
                {leadData.map((lead, index) => (
                  <tr key={lead.phone_number}>
                    <td
                      className="border border-gray-300 p-2"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        const updatedName = e.currentTarget.textContent || "";
                        setLeadData((prevData) =>
                          prevData.map((item, i) =>
                            i === index ? { ...item, name: updatedName } : item
                          )
                        );
                      }}
                    >
                      {lead.name}
                    </td>
                    <td
                      className="border border-gray-300 p-2"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        const updatedPhoneNumber = e.currentTarget.textContent || "";
                        setLeadData((prevData) =>
                          prevData.map((item, i) =>
                            i === index ? { ...item, phone_number: updatedPhoneNumber } : item
                          )
                        );
                      }}
                    >
                      {lead.phone_number}
                    </td>
                    <td
                      className="border border-gray-300 p-2"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        const updatedSource = e.currentTarget.textContent || "";
                        setLeadData((prevData) =>
                          prevData.map((item, i) =>
                            i === index ? { ...item, source: updatedSource } : item
                          )
                        );
                      }}
                    >
                      {lead.source}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {lead.sent_messages || 0}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <button
                        onClick={() => handleDeleteLead(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
    
          </table>
          <button
            onClick={saveData}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Save Data
          </button>
        </>
      )}

      {/* Add New Lead */}
      <div className="mt-6 p-4 border border-gray-300 rounded">
        <h2 className="text-xl font-semibold mb-4">Add New Lead</h2>
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            value={newLead.name}
            onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            placeholder="Name"
            className="border text-black border-gray-300 p-2 rounded"
          />
          <input
            type="text"
            value={newLead.phone_number}
            onChange={(e) =>
              setNewLead({ ...newLead, phone_number: e.target.value })
            }
            placeholder="Phone Number"
            className="border text-black border-gray-300 p-2 rounded"
          />
          <input
            type="text"
            value={newLead.source}
            onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
            placeholder="Source"
            className="border text-black border-gray-300 p-2 rounded"
          />
        </div>
        <button
          onClick={handleAddLead}
          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          Add Lead
        </button>
      </div>

      {/* Paste Phone Numbers */}
      <div className="mt-6 p-4 border border-gray-300 rounded">
  <h2 className="text-xl font-semibold mb-4">Bulk Add Phone Numbers</h2>
  <textarea
    rows={5}
    placeholder="Paste phone numbers here, separated by commas or new lines"
    onChange={(e) => setBulkPhoneNumbers(e.target.value)}
    value={bulkPhoneNumbers}
    className="border text-black border-gray-300 p-2 w-full rounded"
  ></textarea>
  <button
            onClick={handleBulkAdd}
                  className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          Add Phone Numbers
        </button>
      </div>


      {/* Import Leads */}
      <div className="mt-6 p-4 border border-gray-300 rounded">
      <h2 className="text-xl font-semibold mb-4">Import Leads</h2>
      <input
        type="file"
        accept=".json,.csv"
        onChange={handleImportLeads}
        className="block"
      />
      <p className="text-gray-400 mt-2">
        Upload a JSON or CSV file with an array of leads. Example formats:
      </p>
      <pre className="bg-gray-100 p-2 rounded">
        JSON:
        {JSON.stringify(
          [{ name: "John Doe", phone_number: "1234567890", source: "Website" }],
          null,
          2
        )}
      </pre>
      <pre className="bg-gray-100 p-2 rounded mt-2">
        CSV:
        {"name,phone_number,source\nJohn Doe,1234567890,facebook/wpforms/other"}
      </pre>
          </div>
        </div>
  );
};

export default LeadsTable;
