// app/dashboard/layout.tsx
"use client";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { SessionProvider } from "next-auth/react";
import "./dashboard.css"; // Optional: Use a CSS file to customize dashboard styling.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="dashboard-body">{children}</div>
      </div>
    </div>
    </SessionProvider>
  );
}
