import { getAllUsersFromDatabase, update_user } from "./utils";
import { DateTime } from "luxon";
import { find_qr_id_by_phone } from "./utils";
import { deleteFile } from "./google_storage/google_storage";
import dotenv from "dotenv";  
import axios from "axios";
import { insta_script } from "@/src/insta-section/insta_script";
import { findPlanById, sendEmail } from "./utils";
dotenv.config();

const emailSubjectExpriringSoon = "Your subscription is expiring soon";
const emailBodyExpriringSoon = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">Subscription Expiring Soon</h2>
    <p style="color: #666; line-height: 1.5;">
        Your subscription is expiring in 3 or less days. Please renew it to continue using our services.
    </p>
    <div style="margin-top: 20px;">
        <a href=${process.env.NEXT_PUBLIC_BASE_URL} style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Renew Now</a>
    </div>
</div>
`;

const emailSubjectExpired = "Your subscription has expired";
const emailBodyExpired = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">Subscription Expired</h2>
    <p style="color: #666; line-height: 1.5;">
        Your subscription has expired. Please <a href=${process.env.NEXT_PUBLIC_BASE_URL} style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">renew</a> it to continue using our services.
    </p>
</div>
`;

export const processCronJob = async () => {
  console.log(`Running cron job`);
  let users = await getAllUsersFromDatabase();

  users.forEach((user) => {
    let kbAppBaseUrl = user?.kbAppBaseUrl || "http://localhost:4000";
    let scheduledMessages = user.scheduledMessages || [];
    let leads = user?.leads;

    scheduledMessages.forEach((message, index) => {
      console.log(`Processing message: ${message.message}`);

      let luxonTimeZone =
        message.timeZone.replace(/^gmt/i, "") !== "+00:00"
          ? message.timeZone.replace(/^gmt/i, "")
          : "UTC";

      console.log(`Luxon Timezone: ${luxonTimeZone}`);

      // Parse the scheduled time with the given timezone
      let scheduledDate = DateTime.fromISO(message.scheduleTime, {
        zone: luxonTimeZone,
      });

      const currentDate = DateTime.now().setZone(luxonTimeZone);

      console.log(`Current date: ${currentDate}`);
      console.log(`Scheduled date: ${scheduledDate}`);

      // if logic - current_time >= scheduled_time else
      if (currentDate >= scheduledDate) {
        console.log(
          "Current time is greater than or equal to the scheduled time. Sending message."
        );

        let { clientId, keyThing } = find_qr_id_by_phone(
          user,
          message.fromNumber
        );
        console.log(
          `Found clientId: ${clientId}, keyThing: ${keyThing} for phone number: ${message.fromNumber}`
        );

        let content = message.message;
        console.log(`Message content: ${content}`);

        let toNumbersArray = Array.isArray(message.toNumbers)
          ? message.toNumbers
          : JSON.parse(message.toNumbers || "[]");
        console.log(`To numbers array: ${JSON.stringify(toNumbersArray)}`);

        let mediaURL = message.mediaURL;

        let messageAndPhoneNumbers = [];

        for (const toNumber of toNumbersArray) {
          const lead = leads.find((lead) => lead.phone_number === toNumber);

          let personalizedMessage = content;

          if (lead) {
            personalizedMessage = personalizedMessage.replace(
              "{{name}}",
              lead.name
            );
          } else {
            personalizedMessage = personalizedMessage.replace(
              /\s*{{name}}\s*/,
              ""
            );
          }
          let messageAndPhoneNumber = {
            message: personalizedMessage,
            phone_number: toNumber,
          };
          console.log(
            `messageAndPhoneNumber: ${JSON.stringify(messageAndPhoneNumber)}`
          );

          messageAndPhoneNumbers.push(messageAndPhoneNumber);
        }

        let response = fetch(`${kbAppBaseUrl}/send-message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId,
            messageAndPhoneNumbers,
            mediaURL,
          }),
        });

        if (mediaURL) {
          deleteFile(mediaURL);
        }

        scheduledMessages.splice(index, 1);

        update_user(
          { unique_id: user.unique_id },
          { scheduledMessages: scheduledMessages }
        );

        return true;
      } else {
        console.log(
          "Current time is less than the scheduled time. Wait or reschedule."
        );
        return null;
      }
    });
  });
};

export const processCronCampaignJob = async () => {
  console.log(`Running CAMPAIGNS cron job`);
  let users = await getAllUsersFromDatabase();

  users.forEach((user) => {
    let campaigns = user?.campaigns || [];

    campaigns.forEach((campaign, index) => {
      console.log(`Processing campaign: ${campaign.name}`);

      let luxonTimeZone =
        campaign.timeZone.replace(/^gmt/i, "") !== "+00:00"
          ? campaign.timeZone.replace(/^gmt/i, "")
          : "UTC";

      console.log(`Luxon Timezone: ${luxonTimeZone}`);

      const currentDate = DateTime.now().setZone(luxonTimeZone);
      
      let executeCampaign = false;
      let indexOfScheduledTime = null;

      // Parse the scheduled time with the given timezone
      for (let i = campaign.numberOfRunsExecuted; i < campaign.scheduledTimes.length; i++) {
        let scheduledDate = DateTime.fromISO(campaign.scheduledTimes[i], {
          zone: luxonTimeZone,
        });
        if (currentDate >= scheduledDate) {
          executeCampaign = true;
          break;
        }
      }

        // if logic - current_time >= scheduled_time else
      if (executeCampaign) {
        
        const campaignId = campaign.campaignId;

        console.log(`Executing campaign: ${campaignId}`);

        if (!campaign.completed) { 
        let response = axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/campaign/execute`, {
          campaignId: campaignId,
          userUniqueId: user.unique_id
        });

      }

        return true;
      } else {
        console.log(
          "Current time is less than the scheduled time. Wait or reschedule."
        );
        return null;
      }
    });
  });
};


export const processCronInstaResponseJob = async () => {
  console.log(`Running INSTAGRAM RESPONSE cron job`);
  let users = await getAllUsersFromDatabase();

  for (const user of users) {
    if (user?.planActive && user?.instaAcc?.username && user?.instaAcc?.password) {
      console.log(`Running INSTAGRAM RESPONSE cron job for user: ${user.unique_id}`);
      await insta_script(user);
    } else {
      continue;
    }
  }
};

export const processCronCheckSubscriptionsJob = async () => {
  console.log(`Running CHECK SUBSCRIPTIONS cron job`);

  let users = await getAllUsersFromDatabase();

  const now = DateTime.now();

  for (const user of users) {
    if (user?.planActive && user?.expiresAt < now) {
      await update_user({unique_id: user.unique_id}, { planActive: false });
      if (!user?.lastSentEmail) {
        await sendEmail(user.email, emailSubjectExpired, emailBodyExpired);
        await update_user({unique_id: user.unique_id}, { lastSentEmail: now });
      } else if (user?.lastSentEmail && user?.lastSentEmail < now.minus({ days: 1 })) {
        await sendEmail(user.email, emailSubjectExpired, emailBodyExpired);
        await update_user({unique_id: user.unique_id}, { lastSentEmail: now });
      }
    } else if (user?.planActive && user?.expiresAt < now.plus({ days: 3 })) {
      if (!user?.lastSentEmail) {
        await sendEmail(user.email, emailSubjectExpired, emailBodyExpired);
        await update_user({unique_id: user.unique_id}, { lastSentEmail: now });
      } else if (user?.lastSentEmail && user?.lastSentEmail < now.minus({ days: 1 })) {
        await sendEmail(user.email, emailSubjectExpired, emailBodyExpired);
        await update_user({unique_id: user.unique_id}, { lastSentEmail: now });
      }
    }
  }
};
