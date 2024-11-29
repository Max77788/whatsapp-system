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
  const [mediaAttachment, setMediaAttachment] = useState<File | null>(null);
  const [isMediaPreviewVisible, setIsMediaPreviewVisible] = useState(false);

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
        toast.success("Template saved successfully!");
        await new Promise(resolve => setTimeout(resolve, 2000));
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
      const formData = new FormData();
      formData.append("fromNumber", fromNumber);
      formData.append("toNumbers", JSON.stringify(toNumbers));
      formData.append("message", message);
      formData.append("scheduleTime", scheduleTime);
      formData.append("timeZone", timeZone);
      
      if (mediaAttachment) {
        formData.append("media", mediaAttachment);
      }
  
      try {
        const response = await fetch("/api/whatsapp-part/schedule-message", {
          method: "POST",
          body: formData,
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
      const formData = new FormData();
      formData.append("fromNumber", fromNumber);
      formData.append("toNumbers", JSON.stringify(toNumbers));
      formData.append("message", message);
      
    
      if (mediaAttachment) {
        formData.append("media", mediaAttachment);
      }
  
      try {
        const response = await fetch("/api/whatsapp-part/send-message", {
          method: "POST",
          body: formData, // Use FormData for file uploads
        });
  
        if (response.ok) {
          toast.success("Message sent!");
          await new Promise(resolve => setTimeout(resolve, 2000));
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
    size={toPhones?.length || 5}
    value={toNumbers}
    onChange={(e) => {
      const values = Array.from(e.target.selectedOptions, (option) => option.value);
      if (values.includes('ALL')) {
        // If "Choose All" is selected, toggle selection of all options
        setToNumbers(toNumbers.length === toPhones.length ? [] : [...toPhones]);
      } else {
        setToNumbers(values);
      }
    }}
    className="w-full text-black border border-gray-300 p-2 rounded"
  >
    <option value="ALL" disabled={!toPhones?.length}>
      Choose All
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
  <div className="mt-1 text-gray-400 italic">{toNumbersDisplay}</div>
  <div className="mt-1 text-gray-400 italic">
    <b>Shift + click</b> to select multiple numbers
  </div>
</div>

      </div>

      <div className="mb-12">
        <label className="block mb-2 font-semibold">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-40 text-black border border-gray-300 rounded"
          placeholder="Enter your message here..."
        />
        <i className="text-black">{`*include {{name}} to insert the name of the recipient. E.g. "Hello {{name}}, how are you?"`}</i>
      </div>

      {/* Phone Screen Design */}
      {!isSaveModalOpen && !isLoadModalOpen && !isScheduleModalOpen && <div className="relative flex justify-center items-center mt-16 mb-12">
  {/* Phone Frame */}
  <img
    src="/static/phone-frame.png" // Replace with the actual path to your phone frame image
    alt="Phone Frame"
    className="absolute w-72 h-[calc(100vh-10rem)] object-contain"
  />

  {/* Phone Content */}
<div className="relative w-56 h-[calc(48vh)] bg-white rounded-2xl shadow-lg p-4 z-10">

  {/* Media Preview with Icon */}
  {isMediaPreviewVisible && (
    <div className="flex items-start gap-2">
      {/* User Icon */}
      <div className="w-8 h-8 flex-shrink-0 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
        U
      </div>
      {/* Media Preview and Caption */}
      <div className="flex flex-col">
        {/* Media Preview */}
        <div className="w-40 h-24 bg-blue-100 border border-blue-300 rounded-lg flex items-center justify-center text-blue-800 text-sm text-center">
          Your file/video/image here
        </div>
        {/* Caption Message */}
        <div
          className="mt-2 bg-green-700 border text-white border-blue-300 rounded-lg p-2 w-full max-w-[10rem] break-words"
          style={{ minHeight: "3rem" }}
        >
          {message || "Type a caption for your file..."}
        </div>
      </div>
    </div>
  )}

  {/* Regular Message (if no media preview) */}
  {!isMediaPreviewVisible && (
    <div className="flex items-start gap-2">
      {/* User Icon */}
      <div className="w-8 h-8 flex-shrink-0 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
        U
      </div>
      {/* Message Content */}
      <div
        className="flex-1 bg-green-700 border text-white border-blue-300 rounded-lg p-2 w-full max-w-[10rem] break-words"
        style={{ minHeight: "3rem" }}
      >
        {message || "Type a message to see it here..."}
      </div>
    </div>
  )}
</div>


</div>
}



      {/* Media Attachment Input */}
    <div className="mb-4">
      <label className="block mb-2 font-semibold">Media Attachment (optional)</label>
      <input
        type="file"
        accept="image/*,.pdf" // Accept only image and pdf files
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
            setMediaAttachment(file); // Store the file in state
            setIsMediaPreviewVisible(!!file); // Show preview if a file is uploaded
          } else {
            setMediaAttachment(null); // Clear the file if it's not an accepted type
            setIsMediaPreviewVisible(false); // Hide preview if the file is not accepted
            alert("Only image and PDF files are allowed.");
            if (!!file) {
              location.reload();
            }
          }
        }}
        className="w-full text-black border border-gray-300 p-2 rounded"
      />
      <p className="text-gray-500 italic">*supported file types: image, pdf</p>
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
            <select
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full text-black mb-4 p-2 border border-gray-300 rounded"
            >
              {Array.from({ length: 288 }, (_, i) => {
                const date = new Date();
                date.setMinutes(Math.floor(date.getMinutes() / 5) * 5 + i * 5);
                const timeString = date.toISOString().slice(0, 16);
                return (
                  <option key={i} value={timeString}>
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </option>
                );
              })}
            </select>
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
            <p className="text-gray-500 text-sm mb-4">*in case of schedule time is in the past, the message will be sent immediately</p>
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
