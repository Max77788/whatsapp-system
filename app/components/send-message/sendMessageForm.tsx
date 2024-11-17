"use client";

import { useSession } from "next-auth/react";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { loadAllYaml } from "@kubernetes/client-node";

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
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<{ template_name: string; message: string }[]>(
    []
  );
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");
  const [timeZone, setTimeZone] = useState("");

  const handleSaveMessage = async () => {
    try {
      const userEmail = session?.user?.email;
      if (!userEmail) {
        alert("User email not found.");
        return;
      }

      const templateData = { message, template_name: templateName };

      const response = await fetch("/api/message/save-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          messageTemplates: templateData,
        }),
      });

      if (response.ok) {
        alert("Template saved successfully!");
        setIsSaveModalOpen(false); // Close modal
        setTemplateName(""); // Reset template name
        location.reload();
      } else {
        alert("Failed to save the template.");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert("An error occurred while saving the template.");
    }
  };

  const handleScheduleMessage = async () => {
    if (fromNumber && toNumbers.length > 0 && message && scheduleTime && timeZone) {
      try {
        const response = await fetch("/api/whatsapp-part/schedule-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromNumber,
            toNumbers,
            message,
            scheduleTime,
            timeZone,
          }),
        });
  
        if (response.ok) {
          toast.success("Message scheduled successfully!");
          setIsScheduleModalOpen(false); // Close the modal
          location.reload();
        } else {
          toast.error("Failed to schedule message.");
        }
      } catch (error) {
        console.error("Error scheduling message:", error);
        toast.error("An error occurred while scheduling the message.");
      }
    } else {
      toast.error("Please fill in all fields.");
    }
  };
  const handleSendMessage = async () => {
    if (fromNumber && toNumbers.length > 0 && message) {
      
      const response = await fetch("/api/whatsapp-part/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromNumber,
          toNumbers,
          message
        }),
      });

      if (response.ok) {
        toast.success("Message sent!");
        location.reload();
      } else {
        toast.error("Failed to send message.");
      }
    } else {
      toast.error("Please fill in all fields.");
    }
  };

  const advancedSetIsSaveModalOpen = () => {
    if (message.length > 0) {
      setIsSaveModalOpen(true);
    } else {
      toast.error("Please enter a message.");
    }
  };

  const advancedSetIsScheduleModalOpen = () => {
    if (fromNumber && toNumbers.length > 0 && message) {
      setIsScheduleModalOpen(true);
    } else {
      toast.error("Please fill in all fields.");
    }
  };

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


  const handleLoadMessageFromTemplate = async () => {
    try {
      const response = await fetch("/api/message/get-templates", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const data = await response.json();

        if (data.messageTemplates && data.messageTemplates.length > 0) {
          setTemplates(data.messageTemplates);
        } else {
          setTemplates([]);
        }
        setIsLoadModalOpen(true);
      } else {
        alert("Failed to load templates.");
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      alert("An error occurred while loading templates.");
    }
  };

  const toNumbersDisplay =
    toNumbers.length > 1
      ? `${toNumbers.length} numbers selected`
      : toNumbers.join(", ") || "Select phone number(s)";

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
            size={toPhones.length || 5}
            value={toNumbers}
            onChange={(e) => {
              setToNumbers(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }}
            className="w-full text-black border border-gray-300 p-2 rounded"
          >
            {toPhones.length ? (
              toPhones.map((phone) => (
                <option key={phone} value={phone}>
                  {phone}
                </option>
              ))
            ) : (
              <option disabled>No phones</option>
            )}
          </select>
          <div className="mt-1 text-gray-400 italic">{toNumbersDisplay}</div>
          <div className="mt-1 text-gray-400 italic">
            <b>Shift + click</b> to select multiple numbers
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-40 text-black border border-gray-300 rounded"
          placeholder="Enter your message here..."
        />
      </div>

      <div className="flex justify-between gap-4">
        <button
          onClick={advancedSetIsSaveModalOpen}
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          Save Message
        </button>
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Send Message
        </button>
        <button
          onClick={handleLoadMessageFromTemplate}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Load Message from a Template
        </button>
        <button
          onClick={advancedSetIsScheduleModalOpen}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Schedule Message
        </button>
      </div>

      {/* Save Template Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg text-black font-bold mb-4">Save Template</h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name"
              className="w-full text-black mb-4 p-2 border border-gray-300 rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg text-black font-bold mb-4">Schedule Message</h3>
            <label className="block mb-2 font-semibold text-black">Schedule Time</label>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full text-black mb-4 p-2 border border-gray-300 rounded"
            />
            <label className="block mb-2 font-semibold text-black">Time Zone</label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full text-black mb-4 p-2 border border-gray-300 rounded"
            >
              <option value="" disabled>Select Time Zone</option>
              {timeZones.map((zone) => (
    <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleMessage}
                className="px-4 py-2 bg-purple-500 text-white rounded"
              >
                Schedule
              </button>
            </div>
          </div>
              </div>
            )}

      {/* Load Template Modal */}
      {isLoadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-lg text-black font-bold mb-4">
              Load a Template
            </h3>
            {templates.length > 0 ? (
              <table className="table-auto w-full text-black">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Template Name</th>
                    <th className="px-4 py-2">Template Content</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{template.message}</td>
                      <td className="border px-4 py-2">{template.template_name}</td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => {
                            setMessage(template.message);
                            setIsLoadModalOpen(false);
                          }}
                          className="px-2 py-1 bg-green-500 text-white rounded"
                        >
                          Use It
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-black">No templates available yet.</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsLoadModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMessageForm;
