// app/dashboard/page.tsx
"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "../../lib/auth/serverStuff";
import { authOptions } from "../../lib/auth/serverStuff";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { cookies } from "next/headers";
import { useEffect } from "react";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}


export default async function DashboardPage() {

  const cookieStore = await cookies();
  console.log(cookieStore);
  const loggedOut = cookieStore.get("loggedOut")?.value === "true";
  console.log(`loggedOut: ${loggedOut}`);

  await loginIsRequiredServer(loggedOut);

  const session = await getServerSession(authOptions);

  await wait(1000);

  console.log(`session: ${JSON.stringify(session)}`);

  /*
  // Check if the session is loading or if there is no session
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  */

  // Render the dashboard content if the user is authenticated
  return (
    <div className="dashboard-container">

        {/* Main content section */}
        <div className="main-content">

          <div className="dashboard-body">
            {/* Greeting Section */}
            <h1 className="dashboard-greeting">Hello, {session?.user?.name}!</h1>

            {/* Content sections */}
            <div className="dashboard-sections">
              <div className="notifications-section">
                <h2>System Notifications & Alerts</h2>
                {/* Add content for notifications */}
              </div>
              <div className="subscription-section">
                <h2>Subscription Details</h2>
                {/* Add content for subscription details */}
              </div>
            </div>

            {/* Package details section */}
            <div className="package-details">
              <h2>Package Details</h2>
              {/* Add content for package details */}
            </div>
            <button><a href="/settings">Settings</a></button>
          </div>
        </div>
      </div>
  );
};
