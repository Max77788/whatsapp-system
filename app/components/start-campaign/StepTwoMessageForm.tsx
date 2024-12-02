"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';

interface Props {
  leads: { name: string; phone_number: string }[]; // Leads passed from state as recipients
  goBack: () => void; // Function to go back to the previous step
  goForwardStartCampaign: () => void; // Function to go forward to the next step
  goForwardScheduleCampaign: () => void; // Function to go forward to the next step
  fromNumbers: string[];
}

const StepTwoMessageForm: React.FC<Props> = ({ leads, goBack, goForwardStartCampaign, goForwardScheduleCampaign, fromNumbers }) => {
  const [fromNumber, setFromNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [mediaAttachment, setMediaAttachment] = useState<File | null>(null);
  const [isMediaPreviewVisible, setIsMediaPreviewVisible] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const timeZones = [
    "GMT-12:00",
    "GMT-11:00",
    "GMT-10:00",
    "GMT-09:00",
    "GMT-08:00",
    "GMT-07:00",
    "GMT-06:00",
    "GMT-05:00",
    "GMT-04:00",
    "GMT-03:00",
    "GMT-02:00",
    "GMT-01:00",
    "GMT+00:00",
    "GMT+01:00",
    "GMT+02:00",
    "GMT+03:00",
    "GMT+04:00",
    "GMT+05:00",
    "GMT+06:00",
    "GMT+07:00",
    "GMT+08:00",
    "GMT+09:00",
    "GMT+10:00",
    "GMT+11:00",
    "GMT+12:00",
  ];

  const handleStartCampaign = async () => {
    if (campaignName && fromNumber && message && leads.length > 0) {
      const formData = new FormData();
      formData.append("campaignName", campaignName);
      formData.append("fromNumber", fromNumber);
      formData.append("message", message);
      formData.append("leads", JSON.stringify(leads));

      const campaignId = campaignName.toLowerCase().replace(/\s+/g, '-') + '-' + uuidv4().slice(-4);
      
      formData.append("campaignId", campaignId);

      if (mediaAttachment) {
        formData.append("media", mediaAttachment);
      }

      try {
        const response = await fetch("/api/campaign/create", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          toast.success("Campaign started successfully!");
          axios.post("/api/campaign/execute", {
            campaignId: campaignId
          });
          goForwardStartCampaign();
        } else {
          toast.error("Failed to start campaign.");
        }
      } catch (error) {
        console.error("Error starting campaign:", error);
        toast.error("An error occurred while starting the campaign.");
      }
    } else {
      toast.error("Please fill in all fields.");
    }
  };

  const handleScheduleCampaign = async () => {
    if (campaignName && fromNumber && message && leads.length > 0 && scheduleTime && timeZone) {
      const formData = new FormData();
      formData.append("campaignName", campaignName);
      formData.append("fromNumber", fromNumber);
      formData.append("message", message);
      formData.append("leads", JSON.stringify(leads));
      formData.append("scheduleTime", scheduleTime);
      formData.append("timeZone", timeZone);

      const campaignId = campaignName.toLowerCase().replace(/\s+/g, '-') + '-' + uuidv4().slice(-4);
      formData.append("campaignId", campaignId);

      if (mediaAttachment) {
        formData.append("media", mediaAttachment);
      }

      try {
        const response = await fetch("/api/campaign/schedule", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          toast.success("Campaign scheduled successfully!");
          setIsScheduleModalOpen(false);
          goForwardScheduleCampaign();
        } else {
          toast.error("Failed to schedule campaign.");
        }
      } catch (error) {
        console.error("Error scheduling campaign:", error);
        toast.error("An error occurred while scheduling the campaign.");
      }
    } else {
      toast.error("Please fill in all fields.");
    }
  };

  return (
    <div className="flex gap-8 mt-8 p-4 border border-gray-300 rounded-lg">
      {/* Phone Frame on the Left */}
      <div className="relative flex flex-col justify-center items-center w-72">
        <img
          src="/static/phone-frame.png" // Replace with the actual path to your phone frame image
          alt="Phone Frame"
          className="w-full object-contain flex-shrink-0"
        />
        {/* Phone Content */}
        <div className="absolute top-16 w-56 h-[48vh] bg-white rounded-2xl shadow-lg p-4">
          {isMediaPreviewVisible && mediaAttachment ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-40 h-24 bg-blue-100 border border-blue-300 rounded-lg flex items-center justify-center text-blue-800 text-sm">
                Media Preview
              </div>
              <div className="mt-4 bg-green-700 text-white rounded-lg p-2 w-full break-words">
                {message || "Type a caption for your media..."}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                U
              </div>
              <div className="bg-green-700 text-white rounded-lg p-2 w-full max-w-[10rem] break-words">
                {message || "Type a message to see it here..."}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Fields on the Right */}
      <div className="flex-1">
        <div className="mb-4">

          {/* Campaign Name */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Campaign Name</label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Enter campaign name"
            />
          </div>

          <label className="block font-semibold mb-2">From</label>
          <select
            value={fromNumber}
            onChange={(e) => setFromNumber(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="" disabled>
              Select a phone number
            </option>
            {fromNumbers.map((fromNumber) => (
              <option key={fromNumber} value={fromNumber}>
                {fromNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-40 border border-gray-300 rounded p-2"
            placeholder="Enter your message here..."
          />
          <i className="text-gray-500">
            {`*Include {{name}} to personalize messages (e.g., "Hello {{name}}, how are you?")`}
          </i>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2">Media Attachment (optional)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                setMediaAttachment(file);
                setIsMediaPreviewVisible(true);
              } else {
                setMediaAttachment(null);
                setIsMediaPreviewVisible(false);
              }
            }}
            className="w-full border border-gray-300 p-2 rounded"
          />
          <p className="text-gray-500 italic">*Supported file types: images, PDFs</p>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={goBack}
            className="px-4 py-2 bg-gray-300 text-black rounded"
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline-block ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          </button>
          <button
            onClick={handleStartCampaign}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Start Campaign
          </button>
          <button
            onClick={() => {
              if (campaignName && fromNumber && message && leads.length > 0) {
                setIsScheduleModalOpen(true)
              } else {
                toast.error("Please fill in all fields.");
              }
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Schedule Campaign
          </button>
        </div>
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Schedule Campaign</h3>
            <label className="block mb-2 font-semibold">Schedule Time</label>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full mb-4 border border-gray-300 p-2 rounded"
              step="300"
            />
            <label className="block mb-2 font-semibold">Time Zone</label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full mb-4 border border-gray-300 p-2 rounded"
            >
              <option value="" disabled>
                Select Time Zone
              </option>
              {timeZones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleCampaign}
                className="px-4 py-2 bg-purple-500 text-white rounded"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepTwoMessageForm;
