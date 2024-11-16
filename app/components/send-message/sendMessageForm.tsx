"use client";

import React, { useState } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css"; // Import Quill styles

interface Props {
  fromPhones: string[]; // List of available phone numbers for "from" field
  toPhones: string[]; // List of available phone numbers for "to" field
}

const SendMessageForm: React.FC<Props> = ({ fromPhones, toPhones }) => {
  const [fromNumber, setFromNumber] = useState("");
  const [toNumbers, setToNumbers] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    alert("Message sent!");
  };

  const handleSaveMessage = () => {
    alert("Message saved!");
  };

  const handleScheduleMessage = () => {
    alert("Message scheduled!");
  };

  const handleLoadTemplate = () => {
    setMessage("Loaded template message");
  };

  const toNumbersDisplay = toNumbers.length > 1 
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
            <option value="" disabled>{fromPhones.length ? "Select phone number" : "No phones"}</option>
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
            size={toPhones.length || 5} // Adjust the size to the number of items or a default
            value={toNumbers}
            onChange={(e) =>
                setToNumbers(Array.from(e.target.selectedOptions, (option) => option.value))
            }
            className="w-full text-black border border-gray-300 p-2 rounded"
            >
            {toPhones.length ? (
                toPhones.map((phone) => (
                <option key={phone} value={phone}>
                    {phone}`
                </option>
                ))
            ) : (
                <option disabled>No phones</option>
            )}
            </select>
            <div className="mt-1 text-gray-400 italic">{toNumbersDisplay}</div>
            <div className="mt-1 text-gray-400 italic"><b>Shift + click</b> to select multiple numbers</div>
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

      <div className="flex justify-between">
        <button
          onClick={handleSaveMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded"
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
          onClick={handleLoadTemplate}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Load Message from a Template
        </button>
        <button
          onClick={handleScheduleMessage}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Schedule Message
        </button>
      </div>
    </div>
  );
};

export default SendMessageForm;

