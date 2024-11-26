import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from "@/lib/utils";
import Sidebar from "@/app/components/dashboard/Sidebar";
import Header from "@/app/components/dashboard/Header";
import ContactForm7Tab from "@/app/components/webhooks-setup/ContactForm7Tab";
import FacebookTab from "@/app/components/webhooks-setup/FacebookTab";
import WPFormsTab from "@/app/components/webhooks-setup/WPFormsTab";
import Tabs from "./Tabs"; // Client component for tabs
import "./webhookSet.css";

export default async function WebhooksSetupPage() {
  // Fetch session and user details server-side
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email || null;

  let uniqueId = null;
  if (userEmail) {
    const user = await find_user({ email: userEmail });
    uniqueId = user?.unique_id || null;
  }

  return (
    <div className="dashboard-container flex">
      <Sidebar />

      <div className="main-content flex-1">
        <Header userName={session?.user?.name || "Webhooks Setup"} />
        <Tabs uniqueId={uniqueId} />
      </div>
    </div>
  );
}
