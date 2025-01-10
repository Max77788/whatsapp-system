// app/dashboard/page.tsx
"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "@/lib/auth/serverStuff";
import { authOptions } from "@/lib/auth/serverStuff";
import { cookies } from "next/headers";
import './dashboard.css'
import PackageDetails from "../components/dashboard/PackageDetails";
import SubscriptionDetails from "../components/dashboard/SubscriptionDetails";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { find_user, update_user, findPlanById } from "@/lib/utils";
import { retrieveK8sDeploymentUrl } from "@/lib/whatsAppService/kubernetes_part.mjs";
import SentMessagesTracker from "../components/dashboard/SentMessagesTracker";
import { getLocale, getTranslations } from "next-intl/server";
import CreateClientButton from "../components/whatsapp-connection/createClientButton";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}


export default async function DashboardPage() {

  const cookieStore = await cookies();
  const loggedOut = cookieStore.get("loggedOut")?.value === "true";

  const session = await getServerSession(authOptions);
  
  const currentLocale = await getLocale();
  
  await loginIsRequiredServer(session, loggedOut, currentLocale);

  await wait(1000);

  const user = session?.user?.email ? await find_user({ email: session.user.email }) : null;

  /*
  // Check if the session is loading or if there is no session
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  */

  let withKbBaseUrlLink = true, isAdmin = false;
  
  if (process.env.NODE_ENV !== "development") {
  
  if (!user?.kbAppBaseUrl) {
     console.log("Entered retrieve k8s deployment.")

    const kbAppBaseUrl = await retrieveK8sDeploymentUrl(user.unique_id);
    console.log(`kbAppBaseUrl: ${kbAppBaseUrl} from ${user.unique_id}`);
    
    if (kbAppBaseUrl) {
      await update_user({ unique_id: user.unique_id }, { kbAppBaseUrl: kbAppBaseUrl });
      withKbBaseUrlLink = true;
    } else {
      withKbBaseUrlLink = false;
    }
  }
}

  isAdmin = user?.isAdmin || false;

  let isNotPaused = true;
  if (user?.isPaused) {
    isNotPaused = !user?.isPaused;
  }
  const uniqueId = user?.unique_id;

  const planActive = user?.planActive;

  const plan = await findPlanById(user?.planId);

  const maxPhonesConnected = Number(plan?.maxWaAccsNumber) || 1;

  const sentMessages = user?.sentMessages || 0;
  
  const t = await getTranslations("dashboard");
  const userName = t("dashboardName");

  // Render the dashboard content if the user is authenticated
  return (
    <div className="dashboard-container">
        <Sidebar withKbBaseUrlLink={withKbBaseUrlLink} isPaused={!isNotPaused} />
        
        <div className="main-content">
          <Header userName={userName} />
          <div className="dashboard-body">

          
        {/* Main content section */}
        <div className="main-content">

          <div className="dashboard-body">

            {isNotPaused ? <h1 className="dashboard-greeting">{`${t("hello")}, ${session?.user?.name}!`}</h1> : <h1 className="dashboard-greeting">{`${t("hello")}, ${session?.user?.name}! ${t("yourAccountIsPaused")}`}</h1>}
            {isAdmin ? <h1 className="text-2xl font-bold text-black underline"><a href={`/${currentLocale}/admin/packages`}>{t("accessToAdminPanel")}</a></h1> : null}

            <div className="flex justify-center">
              <CreateClientButton maxPhonesConnected={maxPhonesConnected} />
            </div>


            {/* Content sections */}
            <div className="dashboard-sections">
              <div className="notifications-section">
                <SentMessagesTracker sentMessages={sentMessages} />
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
