"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "../../../../lib/auth/serverStuff";
import { authOptions } from "@/lib/auth/serverStuff";
import TablePopup from "../components/chatbot/ChatbotTable";
import { clientPromiseDb } from '@/lib/mongodb';
import { find_user } from '@/lib/utils';
import CreateClientButton from "../components/whatsapp-connection/createClientButton";
import PhoneNumberTacticsTable from "../components/settings/PhoneNumberTacticsTable";
import LabelManager from "../components/label-manager/LabelManager";
import { getLocale } from "next-intl/server";
import TemplateManager from "../components/template-creator/TemplateManager";

export default async function SettingsPage(): Promise<JSX.Element> {
    const session = await getServerSession(authOptions);

    const currentLocale = await getLocale();

    await loginIsRequiredServer(session, false, currentLocale);
    
    const userEmail = session?.user?.email || null;

    return (
        <div className="mt-5 flex flex-col items-center gap-5">
            <TemplateManager userEmail={userEmail} />
        </div>
    );
};
