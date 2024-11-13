"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "../../lib/auth/serverStuff";
import { authOptions } from "@/lib/auth/serverStuff";
import TablePopup from "../components/settings/TablePopup";
import { clientPromiseDb } from '@/lib/mongodb';
import { find_user } from '@/lib/utils';

export default async function SettingsPage(): Promise<JSX.Element> {
    await loginIsRequiredServer();
    
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    const user = await find_user({ email: userEmail });
    const initialData = (user?.messageLogic && user.messageLogic.length > 0) ? user.messageLogic : [
      { type: "includes", search_term: "", message_to_send: "", delay: 5 },
    ];

    return (
        <div className="mt-5">
            <TablePopup initialRows={initialData} />
        </div>
    );
};
