"use client";

import { useEffect, useState } from "react";

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

  const updateSentMessages = (phone_number: string, increment: number) => {
    setLeadData((prevData) =>
      prevData.map((lead) =>
        lead.phone_number === phone_number
          ? { ...lead, sent_messages: (lead.sent_messages || 0) + increment }
          : lead
      )
    );
  };

  const saveData = async () => {
    try {
      const response = await fetch("/api/save-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });

      if (response.ok) {
        alert("Leads data saved successfully!");
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
                <th className="border border-gray-300 p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leadData.map((lead) => (
                <tr key={lead.phone_number}>
                  <td className="border border-gray-300 p-2">{lead.name}</td>
                  <td className="border border-gray-300 p-2">{lead.phone_number}</td>
                  <td className="border border-gray-300 p-2">{lead.source}</td>
                  <td className="border border-gray-300 p-2">{lead.sent_messages || 0}</td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => updateSentMessages(lead.phone_number, 1)}
                      className="px-2 py-1 bg-green-500 text-white rounded"
                    >
                      Send Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={saveData}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Save Data
          </button>
        </>
      )}
    </div>
  );
};

export default LeadsTable;
