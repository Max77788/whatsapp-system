// app/dashboard/layout.tsx
"use client";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { SessionProvider } from "next-auth/react";
import "./dashboard.css"; // Optional: Use a CSS file to customize dashboard styling.
import { find_user } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
