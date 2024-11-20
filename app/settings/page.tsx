"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "../../lib/auth/serverStuff";
import { authOptions } from "@/lib/auth/serverStuff";
import TablePopup from "../components/settings/TablePopup";
import { clientPromiseDb } from '@/lib/mongodb';
import { find_user } from '@/lib/utils';
import CreateClientButton from "../components/whatsapp-connection/createClientButton";
import PhoneNumberTacticsTable from "../components/settings/PhoneNumberTacticsTable";
import LeadsTable from "../components/settings/LeadsTable";

export default async function SettingsPage(): Promise<JSX.Element> {
    await loginIsRequiredServer();
    
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    const user = await find_user({ email: userEmail });
    const uniqueId = user?.unique_id;

    const initialData = (user?.messageLogicList && user.messageLogicList.length > 0) ? user.messageLogicList : [
      { type: "includes", search_term: "", message_to_send: "", delay: 5 },
    ];

    const initialTactics = (user?.phoneNumberTactics && user.phoneNumberTactics.length > 0) ? user.phoneNumberTactics : [
        { phoneNumber: "", tactics: [] }
    ];

    const leadsData = (user?.leads && user.leads.length > 0) ? user.leads : [
        {"name": "Name", "email": "example@example.com", "phone_number": "1234567890", "source": "unknown"}
    ];

    return (
        <div className="mt-5 flex flex-col items-center gap-5">
            {/* <TablePopup initialRows={initialData} /> */}
            <TablePopup initialTactics={initialData} />
            <CreateClientButton />
            <PhoneNumberTacticsTable initialTactics={initialTactics} />
            <LeadsTable leads={leadsData}/>
        </div>
    );
};
