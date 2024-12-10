"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "../../lib/auth/serverStuff";
import { authOptions } from "@/lib/auth/serverStuff";
import TablePopup from "../components/chatbot/ChatbotTable";
import { clientPromiseDb } from '@/lib/mongodb';
import { find_user, findPlanById, getNumberOfActivePhones } from '@/lib/utils';
import CreateClientButton from "../components/whatsapp-connection/createClientButton";
import PhoneNumberTacticsTable from "../components/settings/PhoneNumberTacticsTable";
import LeadsTable from "../components/settings/LeadsTable";

export default async function SettingsPage(): Promise<JSX.Element> {
    await loginIsRequiredServer();
    
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    const user = await find_user({ email: userEmail });
    const uniqueId = user?.unique_id;

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

    return (
        <div className="mt-5 flex flex-col items-center gap-5">
            {/* <TablePopup initialRows={initialData} /> */}
            {showCreateClientButton ? (
              <CreateClientButton maxPhonesConnected={maxPhonesConnected} />
            ) : (
              <div className="px-5 py-3 bg-gray-400 text-white rounded-full">
                Maximum number of phones connected
              </div>
            )}
            <PhoneNumberTacticsTable initialTactics={initialTactics} />
        </div>
    );
};
