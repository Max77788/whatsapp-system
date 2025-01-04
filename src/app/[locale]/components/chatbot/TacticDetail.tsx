"use client";

import React, { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  PanOnScrollMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { useTranslations } from "next-intl";


type RowData = {
  type: string;
  search_term: string;
  message_to_send: string;
  delay: number;
  platforms: string[];
  groups: string[];
  selectedGroups: string[];
};

type InstructionSet = {
  name: string;
  rows: RowData[];
  useWithInstagram: boolean;
};

interface TacticDetailProps {
  selectedSet: InstructionSet | null;
}

export default function TacticDetail({ selectedSet }: TacticDetailProps) {
  if (!selectedSet) return null;

  const t = useTranslations("tacticDetails"); // Replace "yourNamespace" with your actual namespace

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useMemo(() => {
    const generatedNodes = selectedSet.rows.map((row, index) => {
      // Determine the action based on row.type
      const actionText =
        row.type === "starts with" ? t("startsWith") : t("includes");

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
          ),
        },
        style: {
          border: "1px solid #ccc",
          padding: 15,
          borderRadius: 15,
          background: "#fff",
          width: 350, // Set the desired width (in pixels)
          minWidth: 250, // Optional: Ensures a minimum width
        },
      };
    });

    const generatedEdges = selectedSet.rows.map((_, index) => {
      if (index === 0) return null;
      return {
        id: `edge-${index}`,
        source: `node-${index - 1}`,
        target: `node-${index}`,
        animated: true,
        label: t("or"), // Add a label to the edge
        labelStyle: { fill: "#555", fontSize: 12 }, // Optional: Style the label
        labelBgStyle: { fill: "#fff", padding: 4 }, // Optional: Add background to label
        labelBgPadding: [2, 2], // Optional: Padding for label background
        labelBgBorderRadius: 4, // Optional: Rounded background for label
      };
    }).filter(Boolean); // Remove nulls

    // Update state with new nodes and edges
    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }, [selectedSet, t]);

  return (
    <div className="p-4 border-l border-gray-300 w-full h-[600px]">
      <h2 className="text-xl font-bold mb-2">
        Selected Tactic: {selectedSet.name}
      </h2>
      <p className="mb-4">
        Use with Instagram: {selectedSet.useWithInstagram ? "Yes" : "No"}
      </p>

      <div className="w-full h-full">
        <div style={{ height: '80vh', width: '100%', border: '1px solid #ccc' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={false} // Disable node dragging
            nodesConnectable={false} // Disable node connections
            elementsSelectable={true} // Allow nodes to be selectable
            panOnScroll={true} // Enable canvas panning with scroll
            zoomOnScroll={true} // Enable zooming with scroll
            panOnDrag={true} // Enable canvas panning by dragging
            zoomOnPinch={true} // Enable zooming with pinch gestures
            zoomOnDoubleClick={true} // Enable zooming with double click
            panOnScrollSpeed={0.5} // Optional: Adjust scroll speed for smoother panning
            panOnScrollMode={PanOnScrollMode.Free} // Optional: Enable free panning mode
          />
          </div>
        </div>
      </div>
  );
}
