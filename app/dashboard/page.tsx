// app/dashboard/page.tsx
"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "../../lib/auth/serverStuff";
import { authOptions } from "../../lib/auth/serverStuff";
import { cookies } from "next/headers";
import './dashboard.css'
import { useEffect } from "react";
import PackageDetails from "../components/dashboard/PackageDetails";
import SubscriptionDetails from "../components/dashboard/SubscriptionDetails";
import SystemNotifications from "../components/dashboard/SystemNotifications";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { find_user, update_user } from "@/lib/utils";
import { retrieveK8sDeploymentUrl } from "@/lib/whatsAppService/kubernetes_part.mjs";

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

  const user = session?.user?.email ? await find_user({ email: session.user.email }) : null;

  /*
  // Check if the session is loading or if there is no session
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  */

  console.log(`kbAppBaseUrl: ${user?.kbAppBaseUrl}`);

  let withKbBaseUrlLink;
  if (!user?.kbAppBaseUrl) {
    const kbAppBaseUrl = await retrieveK8sDeploymentUrl(user.unique_id);
    console.log(`kbAppBaseUrl: ${kbAppBaseUrl} from ${user.unique_id}`);
    
    if (kbAppBaseUrl) {
      await update_user({ unique_id: user.unique_id }, { kbAppBaseUrl: kbAppBaseUrl });
      withKbBaseUrlLink = true;
    } else {
      withKbBaseUrlLink = false;
    }
  }
  
  const userName = 'Dashboard';

  // Render the dashboard content if the user is authenticated
  return (
    <div className="dashboard-container">
        <Sidebar withKbBaseUrlLink={withKbBaseUrlLink} />
        
        <div className="main-content">
          <Header userName={userName} />
          <div className="dashboard-body"></div>

    <div className="dashboard-container">

        {/* Main content section */}
        <div className="main-content">

          <div className="dashboard-body">
            {/* Greeting Section */}
            <h1 className="dashboard-greeting">Hello, {session?.user?.name}!</h1>

            {/* Content sections */}
            <div className="dashboard-sections">
              <div className="notifications-section">
                <SystemNotifications />
              </div>
              <div className="subscription-section">
                <SubscriptionDetails />
              </div>
            </div>

            {/* Package details section */}
            <div className="package-details">
              <PackageDetails />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};
