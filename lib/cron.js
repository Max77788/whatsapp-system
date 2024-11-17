// utils/cron.js
import nodeCron from "node-cron";
import { getAllUsersFromDatabase } from "./utils";

export const startCronJob = () => {
  const cronJob = nodeCron.schedule("*/1 * * * *", () => {
    console.log("Cron job running every 1 minutes");
    // Assuming you have a function to get all users from the database
    const users = getAllUsersFromDatabase();

    users.forEach(user => {
      console.log(`Processing user: ${user.name}`);
      scheduledMessages = user.scheduledMessages || [];
      scheduledMessages.forEach(message => {
        console.log(message);
      });
    });
  });

  console.log("Cron job initialized");
  return cronJob;
};
