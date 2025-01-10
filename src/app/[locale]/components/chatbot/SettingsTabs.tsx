"use client";

import { useEffect, useState } from "react";
import AITurnOn from "../chatbot/AITurnOn";
import ChatbotTableCopy from "../chatbot/ChatbotTableCopy";
import GreetingMessage from "../chatbot/GreetingMessage";
import TacticDetail from "../chatbot/TacticDetail";  // <-- import our detail component

import { useTranslations } from "next-intl";
import { AnyARecord } from "dns";

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
  const [selectedSet, setSelectedSet] = useState<any>(null); 
  const [greetingMessage, setGreetingMessage] = useState(""); // New state for greeting message
  
  const [leftPanelWidth, setLeftPanelWidth] = useState(35); // width in percentage
  const [isDragging, setIsDragging] = useState(false);

  const [nodes, setNodes] = useState<Array<{ id: string; position: { x: number; y: number }; data: { label: string } }>>([]);
  const [edges, setEdges] = useState<Array<{ id: string; source: string; target: string; animated: boolean }>>([]);

  // ^ for storing whichever set is clicked

  const t = useTranslations("chatbotSetup");

  const tabs = [
    { id: "ai", label: t("aiSettings") },
    { id: "tactics", label: t("tactics") },
    { id: "greet_message", label: t("greetingMessage") },
  ];

  // This function will be passed down to ChatbotTableCopy
  const handleSelectSet = (set: any) => {
    setSelectedSet(set);

    

    // Generate nodes and edges for the selected set
    const generatedNodes = set?.rows?.map((row: any, index: number) => {
      const actionText = row.type === "starts with" ? t("startsWith") : t("includes");

      return {
        id: `node-${index}`,
        position: { x: 100, y: index * 130 },
        data: {
          label: (
            <div>
              <strong>
                {index + 1}. {t("ifMessage")} {actionText}: {row.search_term || t("unnamed")}
              </strong>
              <br />
              {t("delayWaitFor")}: {row.delay} {t("seconds")}
              <br />
              {t("respondWith")}: {row.message_to_send}
            </div>
          )
        },
        style: {
          border: "1px solid #ccc",
          padding: 15,
          borderRadius: 15,
          background: "#fff",
          width: 350, // Set the desired width (in pixels)
          minWidth: 250, // Optional: Ensures a minimum width
        }
      };
    }) || [];

    const generatedEdges = set?.rows
      .map((_: any, index: any) =>
        index > 0
          ? {
            id: `edge-${index}`,
            source: `node-${index - 1}`,
            target: `node-${index}`,
            animated: true,
          }
          : null
      )
      .filter(Boolean);

    setNodes(generatedNodes);
    setEdges(generatedEdges);
  };

  const handleAddRow = (newRow: any) => {
    if (!selectedSet) return;

    const newIndex = selectedSet.rows.length;
    const newNode = {
      id: `node-${newIndex}`,
      position: { x: 100, y: newIndex * 130 },
      data: {
        label: `${newIndex + 1}: ${newRow.search_term || "Unnamed"}`,
      },
    };

    const newEdge = {
      id: `edge-${newIndex}`,
      source: `node-${newIndex - 1}`,
      target: `node-${newIndex}`,
      animated: true,
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, newEdge]);
  };


  const handleRemoveRow = (rowIndex: any) => {
    if (!selectedSet) return;

    setNodes((prev) => prev.filter((_, index) => index !== rowIndex));
    setEdges((prev) => prev.filter((edge: any) => edge.target !== `node-${rowIndex}`));
  };

  const handleMouseDown = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: any) => {
    if (isDragging) {
      document.body.style.userSelect = "none";  // Disable text selection
    } else {
      document.body.style.userSelect = "auto";  // Re-enable text selection
    }

    // Calculate new width as a percentage
    const newWidth = (e.clientX / window.innerWidth) * 100;

    // Set limits for the width (e.g., min 10%, max 50%)
    if (newWidth >= 35 && newWidth <= 45) {
      setLeftPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Optionally, set the initial selected set when component mounts or initialTactics changes
  useEffect(() => {
    if (initialTactics && initialTactics.length > 0) {
      setSelectedSet(initialTactics[0]);
    }
  }, [initialTactics]);

  return (
    <div className="flex flex-row w-full">
      {/* Left Panel */}
      <div className="flex flex-col border-r border-gray-200"
        style={{ width: `${leftPanelWidth}%`,
          minWidth: "350px",
         }}> 
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
              onAddRow={handleAddRow}
              onRemoveRow={handleRemoveRow} // Pass remove row handler
            
            />
          )}
          {activeTab === "greet_message" && <GreetingMessage onMessageChange={setGreetingMessage} />}
        </div>
      </div>

      {/* 
      <div
        className="w-1 cursor-col-resize bg-gray-300"
        onMouseDown={handleMouseDown}
      ></div>
      Draggable Divider */}

      {/* Right Panel - Details */}
      <div style={{
        width: `${100 - leftPanelWidth}%` }}>
      {activeTab === "tactics" && (
          <TacticDetail selectedSet={selectedSet} nodes={nodes} edges={edges} />
          )
      }

        {activeTab === "greet_message" && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="p-8 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold leading-8 text-gray-900 mb-6 text-center">
                {t("greetingMessagePreview")}
              </h3>
              <div className="bg-gray-100 p-6 rounded-md">
                <pre className="text-lg text-gray-700 whitespace-pre-wrap text-center">
                  {greetingMessage || t("noGreetingMessage")}
                </pre>
              </div>
            </div>

          </div>
        )}
        
        {activeTab === "ai" && (
          <div className="flex items-center justify-center mt-40">
             <p>{t("setupTheIsntructionsOnTheSideTab")}</p>
          </div>
        )}

      </div>
    </div>
  );
}
