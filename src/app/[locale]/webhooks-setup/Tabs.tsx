"use client";

import React, { useState } from "react";
import ContactForm7Tab from "@/src/app/[locale]/components/webhooks-setup/ContactForm7Tab";
import FacebookTab from "@/src/app/[locale]/components/webhooks-setup/FacebookTab";
import WPFormsTab from "@/src/app/[locale]/components/webhooks-setup/WPFormsTab";
import { log } from "console";

const tabs = [
  { id: "facebook", label: "Facebook", logo: "/facebook_logo.png" },
  { id: "contact-form-7", label: "Contact Form 7", logo: "/contact-form7.png" },
  { id: "wpforms", label: "WPForms", logo: "/wpforms_logo.png" },
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
            <div className="flex items-center gap-2">
              {tab.label}
              <img src={tab.logo} className="w-4 h-4" />
            </div>

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
