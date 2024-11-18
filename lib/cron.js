// utils/cron.js
import nodeCron from "node-cron";
import { getAllUsersFromDatabase } from "./utils";

export const startCronJob = async () => {
  const cronJob = nodeCron.schedule("*/1 * * * *", () => {
    console.log("Cron job running every 1 minutes");
    // Assuming you have a function to get all users from the database
    const users = getAllUsersFromDatabase();

    users.forEach(user => {
      console.log(`Processing user: ${user.name}`);
      let waAppBaseUrl = user.waAppBaseUrl
      scheduledMessages = user.scheduledMessages || [];
      scheduledMessages.forEach(message => {
        
        // get the time zone and time of the message
        let messageTZ = message.timeZone
        let scheduledTime = message.scheduleTime

        // get the current time in this timezone
        // Get the current time in the specified time zone
        const currentTime = new Date().toLocaleString("en-US", { timeZone: messageTZ });

      // Parse the current time and the scheduled time into Date objects
        const currentDate = new Date(currentTime);
        const scheduledDate = new Date(scheduledTime);

        // if logic - current_time >= scheduled_time else
        if (currentDate >= scheduledDate) {
          let clientId;
          for(i=1; i<=5; i++) {
            if (user?.[`qrCode${i}`].phoneNumber === message.fromNumber){
              clientId = i;
              break
            }  else {
              console.log("Current time is less than the scheduled time. Wait or reschedule.");
              // Your logic when the current time is less than the scheduled time
          }
          }
         
          let content = message.message
          let toNumbers = message.toNumbers

        const response = fetch(`${waAppBaseUrl}/send-message`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clientId,
                    toNumbers,
                    message: content
                })
        });

        

      
        };
    });
  });

  console.log("Cron job initialized");
  return cronJob;
}
  )};
