"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "../../lib/auth/serverStuff";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user } from '@/lib/utils';
import SendMessageForm from "../components/send-message/sendMessageForm";
import ScheduledMessagesListTable from "../components/send-message/scheduledMessagesTable";
import StartCampaign from "../components/start-campaign/StartCampaign";
import UserCampaigns from "../components/start-campaign/UserCampaigns";

/*
const session = await getServerSession(authOptions);
const userEmail = session?.user?.email;
    
const user = await find_user({ email: userEmail });


const handleDelete = (index: number) => {
    const updatedMessages = [...user.scheduledMessages];
    updatedMessages.splice(index, 1); // Remove the selected message
    user.scheduledMessages = updatedMessages; // Update state
  };
*/

export default async function SendMessagePage(): Promise<JSX.Element> {
    await loginIsRequiredServer();

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    const user = await find_user({ email: userEmail });
    const uniqueId = user?.unique_id;

    return (
        <div className="mt-5 flex flex-col items-center gap-5">
            <StartCampaign />
            <UserCampaigns />
        </div>
    );
};
