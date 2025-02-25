import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from "@/lib/utils";
import Sidebar from "@/src/app/[locale]/components/dashboard/Sidebar";
import Header from "@/src/app/[locale]/components/dashboard/Header";
import ContactForm7Tab from "@/src/app/[locale]/components/webhooks-setup/ContactForm7Tab";
import FacebookTab from "@/src/app/[locale]/components/webhooks-setup/FacebookTab";
import WPFormsTab from "@/src/app/[locale]/components/webhooks-setup/WPFormsTab";
import Tabs from "./Tabs"; // Client component for tabs
import "./webhookSet.css";
import { getTranslations } from "next-intl/server";


export default async function WebhooksSetupPage() {
  // Fetch session and user details server-side
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email || null;

  const t = await getTranslations("webhooksSetup");

  let uniqueId = null;
  if (userEmail) {
    const user = await find_user({ email: userEmail });
    uniqueId = user?.unique_id || null;
  }

  return (
    <div className="dashboard-container flex">
      <Sidebar />
      <div className="main-content flex-1">
        <Header userName={"Webhooks"} />
        <p className="font-bold text-center text-2xl mt-10 mb-4">{t("important")}</p>
        <p className="text-center text-lg mb-4">{t("includeTheHeaderXApiKeyWithTheValueOfYourApiKeyInTheWebhookRequest")}</p>
        <p className="text-center text-lg mb-8">
        {t('videoTutorialsTitle')}{' '}
      <b>
        <a href="https://youtu.be/KAdx6EwfhoE" target="_blank" rel="noopener noreferrer">
          {t('wpforms')}
        </a>
      </b>{' '}
      |{' '}
      <b>
        <a href="https://youtu.be/eIZImc-UlYY" target="_blank" rel="noopener noreferrer">
          {t('contactForm7')}
        </a>
      </b>
        </p>
        <Tabs uniqueId={uniqueId} />
      </div>
    </div>
  );
}
