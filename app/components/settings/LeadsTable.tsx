"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

interface Lead {
  name: string;
  phone_number: string;
  source: string;
  group: string; // New group attribute
  sent_messages?: number; // Optional in case it's not always present
}

interface Props {
  leads?: Lead[]; // Prop to accept initial leads data
  groups_list?: string[]; // Prop to accept initial groups data
}

const response = await fetch("/api/user/find_user");
const user = await response.json();
const groups_list_: string[] = user?.leadGroups || ["other"];
console.log(groups_list_);

const LeadsTable: React.FC<Props> = ({ leads = [], groups_list = groups_list_ }: Props) => {
  const [leadData, setLeadData] = useState<Lead[]>(leads);
  const [loading, setLoading] = useState(leads.length === 0);
  const [newLead, setNewLead] = useState<Lead>({
    name: "",
    phone_number: "",
    source: "",
    group: "other", // Default group is 'other'
    sent_messages: 0,
  });
  const [bulkPhoneNumbers, setBulkPhoneNumbers] = useState<string>("");
  const [groups, setGroups] = useState<string[]>(groups_list); // Default group list with 'other'
  const [newGroup, setNewGroup] = useState<string>("");

  const { data: session } = useSession();

  useEffect(() => {
    if (leads.length === 0) {
      const fetchData = async () => {
        try {
          const response = await fetch("/api/leads");
          const data: Lead[] = await response.json();
          setLeadData(
            data.map((lead) => ({
              ...lead,
              sent_messages: lead.sent_messages || 0,
              group: lead.group || "other", // Ensure `group` defaults to 'other'
            }))
          );
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
    setNewLead({ name: "", phone_number: "", source: "", group: "other", sent_messages: 0 });
  };

  const sourcesList = ["facebook", "wpforms", "contactform", "other"];

  const handleDeleteGroup = async (group: string) => {
    setGroups((prevGroups) => prevGroups.filter((g) => g !== group));
    const updatedGroups = groups.filter((g) => g !== group);
    const response = await fetch("/api/leads/add-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groups: updatedGroups }),
    });
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
      group: "other", // Default group
      sent_messages: 0, // Default sent messages
    }));

    setLeadData((prevData) => [...prevData, ...newLeads]);
    setBulkPhoneNumbers(""); // Clear the text area
    alert(`${newLeads.length} phone numbers added successfully!`);
  };

  const handleAddGroup = async () => {
    if (!newGroup.trim()) {
      alert("Please enter a group name.");
      return;
    }

    if (groups.includes(newGroup)) {
      alert("This group already exists.");
      return;
    }

    setGroups((prevGroups) => [...prevGroups, newGroup]);
    setNewGroup("");

    /*
    // Create the updated groups array manually
    const updatedGroups = [...groups, newGroup];

    
    const response = await fetch("/api/leads/add-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groups: updatedGroups }),
    });
    */
  };

  const handleDeleteLead = async (index: number) => {
    setLeadData((prevData) => prevData.filter((_, i) => i !== index));
    
    const userEmail = session?.user?.email;
      if (!userEmail) {
        alert("User email not found.");
        return;
      }
    
    const updatedLeads = leadData.map(({ name, phone_number, source, group, sent_messages }) => ({
      name,
      phone_number,
      source,
      group,
      sent_messages,
    }));

    console.log(`updatedLeads on delete: ${JSON.stringify(updatedLeads)}`);

    const response = await fetch("/api/leads/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail,
        leadsList: updatedLeads,
      }),
    });
  };

  const saveData = async () => {
    try {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        alert("User email not found.");
        return;
      }

      const leadsToSave = leadData.map(({ name, phone_number, source, group, sent_messages }) => ({
        name,
        phone_number,
        source,
        group,
        sent_messages,
      }));

      console.log(`leadsToSave: ${JSON.stringify(leadsToSave)}`);

      const response = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          leadsList: leadsToSave,
        }),
      });

      if (response.ok) {
        toast.success("Leads data saved successfully!");
        await new Promise(resolve => setTimeout(resolve, 1000));
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
                <th className="border border-gray-300 p-2 text-left">Group</th>
                <th className="border border-gray-300 p-2 text-left">Sent Messages</th>
                <th className="border border-gray-300 p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leadData.map((lead, index) => (
                <tr key={`${lead.phone_number}-${index}`}>
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
                  <td className="border border-gray-300 p-2">
                    <select
                      value={lead.source}
                      onChange={(e) => {
                        const updatedGroup = e.target.value;
                        setLeadData((prevData) =>
                          prevData.map((item, i) =>
                            i === index ? { ...item, group: updatedGroup } : item
                          )
                        );
                      }}
                      className="border border-gray-300 rounded p-1"
                    >
                      {sourcesList.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-300 p-2">
                    <select
                      value={lead.group}
                      onChange={(e) => {
                        const updatedGroup = e.target.value;
                        setLeadData((prevData) =>
                          prevData.map((item, i) =>
                            i === index ? { ...item, group: updatedGroup } : item
                          )
                        );
                      }}
                      className="border border-gray-300 rounded p-1"
                    >
                      {groups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-gray-300 p-2">{lead.sent_messages || 0}</td>
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
        <div className="grid grid-cols-4 gap-4">
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
          <select
            value={newLead.source}
            onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
            className="border text-black border-gray-300 p-2 rounded"
          >
            {sourcesList.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
          <select
            value={newLead.group}
            onChange={(e) => setNewLead({ ...newLead, group: e.target.value })}
            className="border text-black border-gray-300 p-2 rounded"
          >
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAddLead}
          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          Add Lead
        </button>
      </div>

      {/* Bulk Add Phone Numbers */}
     <div className="mt-6 p-4 border border-gray-300 rounded">
  <h2 className="text-xl font-semibold mb-4">Bulk Add Phone Numbers</h2>
  <textarea
    value={bulkPhoneNumbers}
    onChange={(e) => setBulkPhoneNumbers(e.target.value)}
    placeholder="Paste phone numbers here, separated by commas or new lines."
    className="w-full border text-black border-gray-300 p-2 rounded h-32 resize-none"
  />
  <button
    onClick={handleBulkAdd}
    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
  >
    Add Bulk Phone Numbers
        </button>
      </div>

      {/* Import CSV */}
<div className="mt-6 p-4 border border-gray-300 rounded">
  <h2 className="text-xl font-semibold mb-4">Import Leads from CSV</h2>
  <input
    type="file"
    accept=".csv"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        Papa.parse(file, {
          header: true, // Assumes the first row contains column headers
          skipEmptyLines: true,
          complete: (result) => {
            const parsedData = result.data as Lead[];
            const newLeads = parsedData.map((lead) => ({
              ...lead,
              group: lead.group || "other", // Default group
              sent_messages: lead.sent_messages || 0, // Default sent messages
            }));
            setLeadData((prevData) => [...prevData, ...newLeads]);
            alert(`${newLeads.length} leads imported successfully!`);
          },
          error: (error) => {
            alert("Failed to parse the CSV file. Please check the format.");
            console.error(error);
          },
        });
      }
    }}
    className="w-full border text-black border-gray-300 p-2 rounded"
  />
      </div>  

      {/* Add New Group */}
      <div className="mt-6 p-4 border border-gray-300 rounded">
        <h2 className="text-xl font-semibold mb-4">Add New Group</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            placeholder="New Group Name"
            className="border text-black border-gray-300 p-2 rounded"
          />
          <button
            onClick={handleAddGroup}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Add Group
          </button>
          <div className="mt-4 flex flex-wrap gap-2">
          {groups.map((group) => (
            group !== 'other' && (
              <div
                key={group}
                className="bg-gray-200 text-black px-3 py-1 rounded flex items-center"
              >
                <span>{group}</span>
                <button
                  onClick={() => handleDeleteGroup(group)}
                  className="ml-2 text-red-500 font-bold"
                >
                  ×
                </button>
              </div>
            )
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsTable;
