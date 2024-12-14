// app/dashboard/layout.tsx
"use client";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { SessionProvider } from "next-auth/react";
import "./profile.css"; // Optional: Use a CSS file to customize dashboard styling.
import { useLocale, useTranslations } from "next-intl";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const currentLocale = useLocale();
  const t = useTranslations("profile");
  
  const userName = t("profile"); // Replace with dynamic username from session or auth context

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