// app/dashboard/layout.tsx
"use client";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { SessionProvider } from "next-auth/react";
import "./chatbot.css"; // Optional: Use a CSS file to customize dashboard styling.
import { useTranslations } from "next-intl";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("sidebar");

  const userName = t("chatbot"); // Replace with dynamic username from session or auth context

  return (
    <SessionProvider>
      <div className="dashboard-container">
        <Sidebar />
        
        <div className="main-content">
          <Header userName={userName} />
          <div className="dashboard-body">{children}</div>
        </div>
      </div>
    </SessionProvider>
  );
}