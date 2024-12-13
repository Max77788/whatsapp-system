"use client";

import React, { useState } from "react";
import ContactForm7Tab from "@/src/app/[locale]/components/webhooks-setup/ContactForm7Tab";
import FacebookTab from "@/src/app/[locale]/components/webhooks-setup/FacebookTab";
import WPFormsTab from "@/src/app/[locale]/components/webhooks-setup/WPFormsTab";

const tabs = [
  { id: "facebook", label: "Facebook" },
  { id: "contact-form-7", label: "Contact Form 7" },
  { id: "wpforms", label: "WPForms" },
];

export default function Tabs({ uniqueId }: { uniqueId: string | null }) {
  const [activeTab, setActiveTab] = useState<string>("facebook");

  return (
    <>
      {/* Tab navigation */}
      <nav className="tabs-navigation flex border-b justify-center text-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2  ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 font-bold"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <main className="dashboard-body p-5">
        {activeTab === "facebook" && <FacebookTab uniqueId={uniqueId} />}
        {activeTab === "contact-form-7" && (
          <ContactForm7Tab uniqueId={uniqueId} />
        )}
        {activeTab === "wpforms" && <WPFormsTab uniqueId={uniqueId} />}
      </main>
    </>
  );
}
