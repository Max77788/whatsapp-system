"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Props {
  fromPhones: string[]; // List of available phone numbers for "from" field
  toPhones: string[]; // List of available phone numbers for "to" field
}

const SendMessageForm: React.FC<Props> = ({ fromPhones, toPhones }) => {
  const { data: session } = useSession();
  const [fromNumber, setFromNumber] = useState("");
  const [toNumbers, setToNumbers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<{ template_name: string; message: string }[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [mediaAttachment, setMediaAttachment] = useState<File | null>(null);
  const [isMediaPreviewVisible, setIsMediaPreviewVisible] = useState(false);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const fetchGroups = async () => {
    try {
      const response = await axios.get("/api/user/find-user");
      const user = response.data;
      setGroups(user.leadGroups || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups.");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const toggleGroupSelection = (group: string) => {
    setSelectedGroups((prevSelectedGroups) => {
      let updatedSelectedGroups;

      if (prevSelectedGroups.includes(group)) {
        // If already selected, remove the group
        updatedSelectedGroups = prevSelectedGroups.filter((g) => g !== group);
      } else {
        // Otherwise, add the group
        updatedSelectedGroups = [...prevSelectedGroups, group];
      }

      // Automatically clear toNumbers if any group is selected
      if (updatedSelectedGroups.length > 0) {
        setToNumbers([]); // Clear toNumbers if groups are chosen
      }

      return updatedSelectedGroups;
    });
  };

  const handleSelectAllToggle = () => {
    if (selectedGroups.length > 0) {
      toast.error("Cannot use 'Select All' when groups are selected.");
      return;
    }
    if (selectAll) {
      setToNumbers([]); // Clear all selections
    } else {
      setToNumbers(toPhones); // Select all phone numbers
    }
    setSelectAll(!selectAll);
  };

  const handleSendMessage = async () => {
    if (fromNumber && toNumbers.length > 0 && message) {
      const formData = new FormData();
      formData.append("fromNumber", fromNumber);
      formData.append("toNumbers", JSON.stringify(toNumbers));
      formData.append("message", message);
      formData.append("groups", JSON.stringify(selectedGroups));

      if (mediaAttachment) {
        formData.append("media", mediaAttachment);
      }

      try {
        const response = await fetch("/api/whatsapp-part/send-message", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          toast.success("Message sent!");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          location.reload();
        } else {
          toast.error("Failed to send message.");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("An error occurred while sending the message.");
      }
    } else {
      toast.error("Please fill in all fields.");
    }
  };

  return (
    <div className="mt-8 p-4 border border-gray-300 rounded-lg">
      <div className="flex justify-between mb-4">
        <div className="flex-1 mr-2">
          <label className="block mb-2 font-semibold">From</label>
          <select
            value={fromNumber}
            onChange={(e) => setFromNumber(e.target.value)}
            className="w-full text-black border border-gray-300 p-2 rounded"
          >
            <option value="" disabled>
              {fromPhones.length ? "Select phone number" : "No phones"}
            </option>
            {fromPhones.map((phone) => (
              <option key={phone} value={phone}>
                {phone}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 ml-2">
          <label className="block mb-2 font-semibold">To</label>
          <select
            multiple
            size={toPhones?.length || 5}
            value={toNumbers}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, (option) => option.value);
              setToNumbers(values);
            }}
            className="w-full text-black border border-gray-300 p-2 rounded"
            disabled={selectedGroups.length > 0} // Disable dropdown if groups are selected
          >
            <option value="ALL" onClick={handleSelectAllToggle}>
              {selectAll ? "Unselect All" : "Select All"}
            </option>
            {toPhones?.length ? (
              toPhones.map((phone) => (
                <option key={phone} value={phone}>
                  {phone}
                </option>
              ))
            ) : (
              <option disabled>No phones</option>
            )}
          </select>
          <div className="mt-1 text-gray-400 italic">{`${toNumbers.length} numbers selected`}</div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold">Send to these Groups</h3>
        <div className="flex flex-wrap gap-4 mt-2">
          {groups.map((group) => (
            <label key={group} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedGroups.includes(group)}
                onChange={() => toggleGroupSelection(group)}
                className="form-checkbox"
              />
              <span>{group}</span>
            </label>
          ))}
        </div>
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

      <div className="mb-2">
        <label className="block mb-2 font-semibold">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-40 text-black border border-gray-300 rounded"
          placeholder="Enter your message here..."
        />
        <i className="text-black">{`*include {{name}} to insert the name of the recipient. E.g. "Hello {{name}}, how are you?"`}</i>
      </div>

      <div className="relative">
        <img
          src="/static/phone-frame.png" // Replace with the actual path to your phone frame image
          alt="Phone Frame"
          className="w-72 mx-auto object-contain flex-shrink-0"
        />
        {/* Phone Content */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-56 h-[48vh] bg-white rounded-2xl shadow-lg p-4">
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
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs p-3">
                U
              </div>
              <div className="bg-green-700 text-white rounded-lg p-2 w-full max-w-[10rem] break-words">
                {message || "Type a message to see it here..."}
              </div>
            </div>
          )}
        </div>
        </div>

      <div className="flex justify-between gap-4">
        <button
          onClick={handleSendMessage}
          className="px-5 py-3 mx-auto bg-green-600 hover:bg-green-700 text-white rounded-full"
        >
          Send Message
        </button>
      </div>
    </div>
  );
};

export default SendMessageForm;
