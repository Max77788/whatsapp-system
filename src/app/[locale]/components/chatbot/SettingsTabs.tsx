"use client";

import { useEffect, useState } from "react";
import AITurnOn from "../chatbot/AITurnOn";
import ChatbotTableCopy from "../chatbot/ChatbotTableCopy";
import GreetingMessage from "../chatbot/GreetingMessage";
import TacticDetail from "../chatbot/TacticDetail";  // <-- import our detail component

import { useTranslations } from "next-intl";

export default function SettingsTabs({
  initialInstructions,
  initialIsOn,
  isInPlan,
  initialTactics,
}: {
  initialInstructions: string;
  initialIsOn: boolean;
  isInPlan: boolean;
  initialTactics: any;
}) {
  const [activeTab, setActiveTab] = useState("tactics");
  const [selectedSet, setSelectedSet] = useState(null); 
  const [greetingMessage, setGreetingMessage] = useState(""); // New state for greeting message
  
  // ^ for storing whichever set is clicked

  const t = useTranslations("chatbotSetup");

  const tabs = [
    { id: "ai", label: "AI Settings" },
    { id: "tactics", label: "Tactics" },
    { id: "greet_message", label: "Greeting Message" },
  ];

  // This function will be passed down to ChatbotTableCopy
  const handleSelectSet = (set: any) => {
    setSelectedSet(set);
  };

  // Optionally, set the initial selected set when component mounts or initialTactics changes
  useEffect(() => {
    if (initialTactics && initialTactics.length > 0) {
      setSelectedSet(initialTactics[0]);
    }
  }, [initialTactics]);

  return (
    <div className="flex flex-row w-full">
      {/* Left Panel */}
      <div className="flex flex-col w-1/4 border-r border-gray-200"> 
        {/* Tabs */}
        <div className="flex flex-row border-b border-gray-200 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 mr-2 ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-500 font-bold"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 bg-gray-50 min-h-screen border-gray-200 rounded-md shadow-md">
          {activeTab === "ai" && (
            <AITurnOn
              initialInstructions={initialInstructions}
              initialIsOn={initialIsOn}
              isInPlan={isInPlan}
            />
          )}
          {activeTab === "tactics" && (
            <ChatbotTableCopy
              initialTactics={initialTactics}
              onSelectSet={handleSelectSet}  // <-- pass callback
            />
          )}
          {activeTab === "greet_message" && <GreetingMessage onMessageChange={setGreetingMessage} />}
        </div>
      </div>

      {/* Right Panel - Details */}
      <div className="w-3/4">
      {activeTab === "tactics" && (
            <TacticDetail selectedSet={selectedSet} />
          )
      }

        {activeTab === "greet_message" && (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 text-center">
                {t("greetingMessagePreview")}
              </h3>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap text-center">
                  {greetingMessage || t("noGreetingMessage")}
                </pre>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "ai" && (
          <div className="flex items-center justify-center mt-40">
             <p>⬅️{t("setupTheIsntructionsOfAIOnTheLeft")}</p>
          </div>
        )}

      </div>
    </div>
  );
}
