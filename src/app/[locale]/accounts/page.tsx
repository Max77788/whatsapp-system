"use server";
import { JSX } from 'react';
import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "../../../../lib/auth/serverStuff";
import { authOptions } from "@/lib/auth/serverStuff";
import TablePopup from "../components/chatbot/ChatbotTable";
import { clientPromiseDb } from '@/lib/mongodb';
import { find_user, findPlanById, getNumberOfActivePhones } from '@/lib/utils';
import CreateClientButton from "../components/whatsapp-connection/createClientButton";
import PhoneNumberTacticsTable from "../components/settings/PhoneNumberTacticsTable";
import LeadsTable from "../components/settings/LeadsTable";
import { getLocale, getTranslations } from "next-intl/server";
import InstaCredentialsForm from "../components/insta-connection/InstaConnectionForm";

export default async function SettingsPage(): Promise<JSX.Element> {
    
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    const currentLocale = await getLocale();
    const t = await getTranslations("accounts");

    await loginIsRequiredServer(session, false, currentLocale);
    
    const user = await find_user({ email: userEmail });
    const uniqueId = user?.unique_id;

    const planActive = user?.planActive;

    const plan = await findPlanById(user?.planId);

    const maxPhonesConnected = Number(plan?.maxWaAccsNumber) || 1;

    const initialTactics = (user?.phoneNumberTactics && user.phoneNumberTactics.length > 0) ? user.phoneNumberTactics : [
        { phoneNumber: "", tactics: [] }
    ];

    const leadsData = (user?.leads && user.leads.length > 0) ? user.leads : [
        {"name": "Name", "email": "example@example.com", "phone_number": "1234567890", "source": "unknown"}
    ];

    const numberOfActivePhones = await getNumberOfActivePhones(user?.email);

    let showCreateClientButton = true;

    if (numberOfActivePhones >= Number(plan?.maxWaAccsNumber)) {
        showCreateClientButton = false;
    }

    if (!planActive) {
        showCreateClientButton = false;
    }

    return (
        <div className="mt-5 flex flex-col items-center gap-5">
            {/* <TablePopup initialRows={initialData} /> */}
            {showCreateClientButton ?  (
              <CreateClientButton maxPhonesConnected={maxPhonesConnected} />
            ) : 
            !planActive ? (
              <div className="px-5 py-3 bg-gray-400 text-white rounded-full">
                {t("your_plan_is_expired")}
              </div>
            ) : (
              <div className="px-5 py-3 bg-gray-400 text-white rounded-full">
                {t("maximum_number_of_phones_connected")}
              </div>
            )}
            <PhoneNumberTacticsTable initialTactics={initialTactics} />
            <InstaCredentialsForm />
        </div>
    );
};
