"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { buttonBigStyle, buttonSmallStyle } from "@styles"

export default function AITurnOn({
  initialInstructions,
  initialIsOn,
  isInPlan
}: {
  initialInstructions: string;
  initialIsOn: boolean;
  isInPlan: boolean;
}) {
  const [isOn, setIsOn] = useState(initialIsOn);
  const [instructions, setInstructions] = useState(initialInstructions);
  const t = useTranslations("chatbotSetup");

  // const [instructionsRef, setInstructionsRef] = useRef(initialInstructions);
  // const [isOnRef, setIsOnRef] = useRef(initialIsOn);


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

  const fetchConfig = async () => {
    const response = await fetch("/api/whatsapp-part/ai-feature/retrieve-config")

    const { instructions, isOn } = await response.json();

    setInstructions(instructions);
    setIsOn(isOn);
  }

  useEffect(() => {
    fetchConfig();
  }, []);

  // Effect to send data when `isOn` changes
  useEffect(() => {
    sendConfig(instructions, isOn);
  }, [isOn, instructions]);

  if (!isInPlan) {
    return (
      <div>
        <h1>{t("notInPlan")}</h1>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-4 gap-1">
        <input
          type="checkbox"
          checked={isOn}
          onChange={(e) => setIsOn(e.target.checked)}
          className="cursor-pointer"
        />
        <label className="text-lg font-semibold">{t("aiSystemOn")}</label>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOn ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <textarea
          placeholder={t("aiSystemInstructionsPlaceholder")}
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
