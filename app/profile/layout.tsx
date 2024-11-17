// app/dashboard/layout.tsx
"use client";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { SessionProvider } from "next-auth/react";
import "./profile.css"; // Optional: Use a CSS file to customize dashboard styling.
import { QRCodeCanvas } from "qrcode.react";

const horrible_qr_code = `
2@uLavPftQOaTMoiPhFtH6rjriEJfh8bF
VrlbVLDNerqweObSEJMjHFMSLANKhtQD8xp5HZu4lzsL5
Vf7aYdMgcNDd0oAJ1udxjhY=,c3ncfWCMcV2MNnCgA/ES
wcJYsIZqHqbjdar/d4cthBw=,2boVZNrodtyT9TxJatAO
9FxF/um5Y/jIj42u//ffmXU=,4yzw34/TdWah/ixL32Rf
xeR80WUtgRiHuCfouSnuFlo=,1
`

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userName = "Profile"; // Replace with dynamic username from session or auth context

  return (
    <SessionProvider>
      <div className="dashboard-container">
        <Sidebar />
        
        <div className="main-content">
          <Header userName={userName} />
          <div className="dashboard-body">{children}</div>
          <div className="flex justify-center">
          </div>
        </div>
        
      </div>
    </SessionProvider>
  );
}