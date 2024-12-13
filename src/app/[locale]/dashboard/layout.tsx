// app/dashboard/layout.tsx
"use client";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { SessionProvider } from "next-auth/react";
import "./dashboard.css"; // Optional: Use a CSS file to customize dashboard styling.
import { find_user } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userName = "Dashboard"; // Replace with dynamic username from session or auth context

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
