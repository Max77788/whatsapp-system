// utils/cron.js
import nodeCron from "node-cron";
import { getAllUsersFromDatabase, update_user } from "./utils";
import { DateTime } from "luxon";
import { find_qr_id_by_phone } from "./utils";
import { deleteFile } from "./google_storage/google_storage";

export const startCronJob = async () => {
  const cronJob = nodeCron.schedule("*/12 * * * * *", async () => {
    // Assuming you have a function to get all users from the database
    let users = await getAllUsersFromDatabase();

    users.forEach(user => {
      let kbAppBaseUrl = user?.kbAppBaseUrl || "http://localhost:4000"; 
      let scheduledMessages = user.scheduledMessages || [];
      scheduledMessages.forEach((message, index) => {
        console.log(`Processing message: ${message.message}`);
        
        let luxonTimeZone = message.timeZone.replace(/^gmt/i, '') !== "+00:00" ? message.timeZone.replace(/^gmt/i, '') : "UTC";
        
        console.log(`Luxon Timezone: ${luxonTimeZone}`)
        
        // Parse the scheduled time with the given timezone
        let scheduledDate = DateTime.fromISO(message.scheduleTime, { zone: luxonTimeZone });

        const currentDate = DateTime.now().setZone(luxonTimeZone);

        console.log(`Current date: ${currentDate}`)
        console.log(`Scheduled date: ${scheduledDate}`)

        // if logic - current_time >= scheduled_time else
        if (currentDate >= scheduledDate) {
          console.log("Current time is greater than or equal to the scheduled time. Sending message.");
          
          
          
          let { clientId, keyThing } = find_qr_id_by_phone(user, message.fromNumber);
          console.log(`Found clientId: ${clientId}, keyThing: ${keyThing} for phone number: ${message.fromNumber}`);
         
          let content = message.message;
          console.log(`Message content: ${content}`);

          let toNumbersArray = Array.isArray(message.toNumbers) ? message.toNumbers : JSON.parse(message.toNumbers || "[]");
          console.log(`To numbers array: ${JSON.stringify(toNumbersArray)}`);

          let mediaURL = message.mediaURL;
          
          let response = fetch(`${kbAppBaseUrl}/send-message`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clientId,
                    toNumbers: toNumbersArray,
                    message: content,
                    mediaURL
                })
        });

        
        if (mediaURL) {
          deleteFile(mediaURL);
        }

        scheduledMessages.splice(index, 1);

        update_user({unique_id: user.unique_id}, {scheduledMessages: scheduledMessages})

      
        } else {
          console.log("Current time is less than the scheduled time. Wait or reschedule.");
        }
    });
  });
  
  return cronJob;
}
  )};
