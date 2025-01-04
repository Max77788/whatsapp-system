"use server";

import { getServerSession } from "next-auth";
import { loginIsRequiredServer } from "../../../../lib/auth/serverStuff";
import { authOptions } from "@/lib/auth/serverStuff";
import { find_user, findPlanById } from "@/lib/utils";
import { getLocale } from "next-intl/server";
import SettingsTabs from "../components/chatbot/SettingsTabs";

export default async function SettingsPage(): Promise<JSX.Element> {
  const session = await getServerSession(authOptions);
  const currentLocale = await getLocale();

  await loginIsRequiredServer(session, false, currentLocale);
  const userEmail = session?.user?.email;

  const user = await find_user({ email: userEmail });
  const uniqueId = user?.unique_id;

  const plan = await findPlanById(user?.planId);

  const isInPlan = plan?.aiIncluded;

  const initialTactics =
    user?.messageLogicList && user.messageLogicList.length > 0
      ? user.messageLogicList
      : [
          {
            name: "test",
            rows: [
              {
                type: "starts with",
                search_term: "Hi",
                message_to_send: "Hello, how can I help you today?",
                delay: 5,
                platforms: ["wpforms"],
              },
            ],
          },
        ];

  const initialInstructions = user?.aiSystemConfig?.instructions || "";
  const initialIsOn = user?.aiSystemConfig?.isOn || false;

  return (
    <SettingsTabs
      initialInstructions={initialInstructions}
      initialIsOn={initialIsOn}
      isInPlan={isInPlan}
      initialTactics={initialTactics}
    />
  );
}
