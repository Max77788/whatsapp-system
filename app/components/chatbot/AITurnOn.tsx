"use client";

import { useState, useEffect } from "react";

export default function AITurnOn({
  initialInstructions,
  initialIsOn,
}: {
  initialInstructions: string;
  initialIsOn: boolean;
}) {
  const [isOn, setIsOn] = useState(initialIsOn);
  const [instructions, setInstructions] = useState(initialInstructions);

  // Function to send data to the server
  const sendConfig = async (updatedInstructions: string, updatedIsOn: boolean) => {
    try {
      const response = await fetch("/api/whatsapp-part/ai-feature/save-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ instructions: updatedInstructions, isOn: updatedIsOn }),
      });

      if (!response.ok) {
        console.error("Failed to save instructions");
      }
    } catch (error) {
      console.error("Error saving instructions:", error);
    }
  };

  // Effect to send data when `isOn` changes
  useEffect(() => {
    sendConfig(instructions, isOn);
  }, [isOn]);

  // Effect to send data when `instructions` changes
  useEffect(() => {
    sendConfig(instructions, isOn);
  }, [instructions]);

  return (
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          checked={isOn}
          onChange={(e) => setIsOn(e.target.checked)}
          className="cursor-pointer"
        />
        <label className="text-lg font-semibold">AI System On</label>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOn ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <textarea
          placeholder="Enter instructions. E.g. You are a massage parlour receptionist. And you are answering user's inquiries."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          cols={50}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none"
        />
      </div>
    </div>
  );
}
