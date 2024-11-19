// utils/cron.js
import nodeCron from "node-cron";
import { getAllUsersFromDatabase, update_user } from "./utils";

export const startCronJob = async () => {
  const cronJob = nodeCron.schedule("*/1 * * * *", () => {
    // Assuming you have a function to get all users from the database
    const users = getAllUsersFromDatabase();

    console.log(`Users: ${users}`);
    
    users.forEach(user => {
      console.log(`Processing user: ${JSON.stringify(user)}`);
      let waAppBaseUrl = user.waAppBaseUrl
      scheduledMessages = user.scheduledMessages || [];
      scheduledMessages.forEach((message, index) => {
        console.log(`Processing message: ${message.message}`);

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
          console.log("Current time is greater than or equal to the scheduled time. Sending message.");
          
          let clientId;
          for(i=1; i<=5; i++) {
            if (user?.[`qrCode${i}`].phoneNumber === message.fromNumber){
              clientId = i;
              break
            }  else {
              console.log("No client id found");
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

        scheduledMessages.splice(index, 1);

        update_user({unique_id: user.unique_id}, {scheduledMessages: scheduledMessages})

      
        } else {
          console.log("Current time is less than the scheduled time. Wait or reschedule.");
        }
    });
  });

  console.log("Cron job initialized");
  return cronJob;
}
  )};
