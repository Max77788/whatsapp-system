"use client";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { SessionProvider } from "next-auth/react";
import "./settings.css"; // Optional: Use a CSS file to customize dashboard styling.
import { useTranslations } from "next-intl";

export default async function SendMessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const t = useTranslations("sidebar");
  const userName = t("sendMessage"); // Replace with dynamic username from session or auth context

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