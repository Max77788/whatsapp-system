"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "../../../../lib/auth/serverStuff";
import { authOptions } from "@/lib/auth/serverStuff";
import ChatbotTable from "../components/chatbot/ChatbotTable";
import { clientPromiseDb } from '@/lib/mongodb';
import { find_user, findPlanById } from '@/lib/utils';
import CreateClientButton from "../components/whatsapp-connection/createClientButton";
import PhoneNumberTacticsTable from "../components/settings/PhoneNumberTacticsTable";
import LeadsTable from "../components/settings/LeadsTable";
import AITurnOn from "../components/chatbot/AITurnOn";
import { getLocale } from "next-intl/server";
import GreetingMessage from "../components/chatbot/GreetingMessage";

export default async function SettingsPage(): Promise<JSX.Element> {
    const session = await getServerSession(authOptions);

    const currentLocale = await getLocale();

    await loginIsRequiredServer(session, false, currentLocale);
    const userEmail = session?.user?.email;
    
    const user = await find_user({ email: userEmail });
    const uniqueId = user?.unique_id;

    const plan = await findPlanById(user?.planId);

    const isInPlan = plan?.aiIncluded;

    const initialTactics = (user?.messageLogicList && user.messageLogicList.length > 0) ? user.messageLogicList : [
        { name: "test", rows: [{type: "starts with", search_term: "Hi", message_to_send: "Hello, how can I help you today?", delay: 5, platforms: ["wpforms"]}] }
    ];

    const initialInstructions = user?.aiSystemConfig?.instructions || "";
    const initialIsOn = user?.aiSystemConfig?.isOn || false;

    return (
        <div className="mt-5 flex flex-col items-center gap-5">
            {/* <TablePopup initialRows={initialData} /> */}
            <AITurnOn initialInstructions={initialInstructions} initialIsOn={initialIsOn} isInPlan={isInPlan} />
            <ChatbotTable initialTactics={initialTactics} />
            <GreetingMessage />
        </div>
    );
};
