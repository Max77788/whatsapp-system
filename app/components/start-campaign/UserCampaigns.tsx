"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
interface Lead {
  name: string;
  phone_number: string;
  mediaURL?: string;
}

interface Campaign {
  campaignName: string;
  fromNumber: string;
  message: string;
  leads: Lead[];
  scheduleTime: string;
  timeZone: string;
  campaignId: string;
  completed: boolean;
}




const UserCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching campaigns from the backend
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/campaigns"); // Replace with your API endpoint
      
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      const data: Campaign[] = await response.json();
      data.sort((a: Campaign, b: Campaign) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime());
      
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaign/delete`, {
        method: "POST",
        body: JSON.stringify({ campaignId }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete campaign");
      }
  
      // Update the local state to remove the deleted campaign
      setCampaigns((prevCampaigns) =>
        prevCampaigns.filter((campaign) => campaign.campaignId !== campaignId)
      );
      toast.success("Campaign deleted successfully");
    } catch (error) {
      console.error("Error deleting campaign:", error);
      setError("Failed to delete the campaign. Please try again.");
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  if (loading) {
    return <div className="animate-pulse flex justify-center">
    <div className="h-30 bg-gray-300 rounded w-120"></div>
  </div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Campaigns</h2>
      {campaigns.length === 0 ? (
        <p>No campaigns found.</p>
      ) : (
        <div className="space-y-6">
          {campaigns.map((campaign) => (
  <div
    key={campaign.campaignId}
    className="border border-gray-300 p-4 rounded-lg shadow-sm flex justify-between items-center"
  >
    <div>
      <h3 className="text-lg font-semibold">{campaign.campaignName}</h3>
      <p className="text-sm text-gray-600 mb-2">
        <strong>From:</strong> {campaign.fromNumber}
      </p>
      <p className="mb-2">
        <strong>Message:</strong> {campaign.message}
      </p>
      {campaign.leads.length > 0 && (
        <div className="mb-2">
          <strong>Leads:</strong>
          <ul className="list-disc ml-6">
            {campaign.leads.map((lead, index) => (
              <li key={index}>
                {lead.name} ({lead.phone_number}){" "}
                {lead.mediaURL && (
                  <a
                    href={lead.mediaURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    Media
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm text-gray-600">
        <strong>Scheduled Time:</strong> {campaign.scheduleTime} (
        {campaign.timeZone})
      </p>
      <p
        className={`mt-2 text-sm font-medium ${
          campaign.completed ? "text-green-600" : "text-yellow-600"
        }`}
      >
        Status: {campaign.completed ? "Completed" : "Pending"}
      </p>
    </div>
      <button
        onClick={() => handleDeleteCampaign(campaign.campaignId)}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
      >
        {!campaign.completed ? "Delete" : "Clear"}
      </button>
  </div>
))}

        </div>
      )}
      
    </div>
    
  );
};

export default UserCampaigns;
