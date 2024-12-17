import { find_user } from '@/lib/utils';
import { IgApiClient } from 'instagram-private-api';
import { generateResponse } from "@/lib/gpt_utils"
import { update_user } from "@/lib/utils";

export async function insta_script(user: any) {
  console.log('Starting insta_script for user:', user.unique_id);
  const ig = new IgApiClient();

  let sent_messages = 0;

  // Login to your Instagram account
  console.log('Generating device for username:', user.instaAcc.username);
  ig.state.generateDevice(user.instaAcc.username);
  console.log('Attempting Instagram login...');
  const loggedInUser = await ig.account.login(user.instaAcc.username, user.instaAcc.password);
  console.log('Successfully logged in as:', loggedInUser.username);

  // Logged-in user's ID
  const loggedInUserId = loggedInUser.pk;
  console.log('Logged in user ID:', loggedInUserId);

  // Listen to incoming direct messages
  console.log('Fetching direct inbox messages...');
  const inbox = await ig.feed.directInbox().items();
  console.log('Number of conversations in inbox:', inbox.length);

  // Iterate over each chat
  console.log('Processing first 2 conversations...');
  for (const conversation of inbox) {
    console.log('Processing conversation:', conversation.thread_id);
    const messages = conversation.items;
    const messagesCount = messages.length;
    console.log('Number of messages in conversation:', messagesCount);

    if (messages[0].user_id === loggedInUserId) {
      console.log('Last message was from logged in user, skipping conversation');
      continue;
    }

    console.log('Building message history...');
    const message_history = messages.map((message: any) => `User ID: ${message.user_id}, Message: ${message.text}`).join('\n');

    console.log(`message_history: ${JSON.stringify(message_history)}`);
    
    console.log('Getting last message from conversation...');
    const last_message = messages[0];
    const message = last_message

    const userId = message.user_id;
    const text = message.text || "";

    console.log(`userId: ${userId}, text: ${text}`);
    console.log('Generating response...');

    const reply_obj = await defineResponse(text, messagesCount, message_history, user);
    console.log('Response object:', reply_obj);

    if (!reply_obj.respond_boolean) {
      console.log('Response not required, breaking conversation loop');
      break;
    } else {
      console.log('Creating direct thread for user:', userId);
      const thread = ig.entity.directThread([userId.toString()]);

      console.log(`Keyword detected in message: "${message.text}"`);

      // Send an automated reply
      if (reply_obj.reply) {
        console.log('Sending reply:', reply_obj.reply);
        await thread.broadcastText(reply_obj.reply);
        console.log('Reply sent successfully');
        sent_messages++;
      }
    }
  }

  let messagesDate =  new Date();

  const previousSentMessages = user?.sentMessages || 0;
  const updatedSentMessages = previousSentMessages + sent_messages;

  await update_user({ unique_id: user.unique_id }, { sentMessages: updatedSentMessages });
  await update_user({ unique_id: user.unique_id }, { messages_date: { date: messagesDate, count: sent_messages }}, "$push")

  console.log(`sent_messages: ${sent_messages}`);

  console.log('Logging out of Instagram...');
  await ig.account.logout();
  console.log('Successfully logged out');
}

export async function verifyInstagramCredentials(username: string, password: string) {
  const ig = new IgApiClient();
  ig.state.generateDevice(username); // Generate device based on username

  try {
   // Attempt login
   const loggedInUser = await ig.account.login(username, password);

    // If login succeeds, proceed to logout
    console.log("Login successful!", loggedInUser.username);

    await ig.account.logout();

    // If login is successful, return true
    console.log('Login successful!');
    return { success: true, message: 'Credentials are valid.' };
  } catch (error: any) {
    // Handle login errors
    if (error.response?.body?.message) {
      console.error('Login error:', error.response.body.message);
      return { success: false, message: error.response.body.message };
    }
    console.error('Unexpected error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}


async function defineResponse(message: string, previous_messages_count: number, message_history: string, user: any) {
    
    let respond_boolean = true;
    console.log(`Initial respond_boolean: ${respond_boolean}`);

    let reply, delay=5;
    console.log(`Initial reply: ${reply}, delay: ${delay}`);

    if (user?.greetingMessage?.isGreetingEnabled && user?.greetingMessage?.useWithInstagram) {
        console.log("Greeting message is enabled and configured for Instagram");
        const formedMessage = `${user?.greetingMessage?.header}

${user?.greetingMessage?.bodyOptions.map((obj: any, index: number) => `${index + 1}. ${obj.option}`).join('\n')}

${user?.greetingMessage?.footer}
${user?.greetingMessage?.triggerWordMessage}: ${user?.greetingMessage?.triggerWord}`

        console.log(`Formed greeting message: ${formedMessage}`);

        if (previous_messages_count === 1) {
            console.log("First message from sender - sending greeting");
            reply = formedMessage;
            return {reply, delay: 5, respond_boolean: true};
        } else if (message === user?.greetingMessage?.triggerWord) {
            console.log("Trigger word detected - sending greeting");
            reply = formedMessage;
            return {reply, delay: 5, respond_boolean: true};
        }

        user?.greetingMessage?.bodyOptions.forEach((obj: any, index: number) => {
            console.log(`Checking option ${index + 1}: ${obj.option}`);
            if (message === obj.option || message === (index+1).toString()) {
                console.log(`Option match found - sending response: ${obj.response}`);
                reply = obj.response;
                return {reply, delay: 5, respond_boolean: true};
            }
        });
        
    }

    console.log("Processing message logic list");
    const text_tactics_list = user?.messageLogicList.filter((logic: any) => logic?.useWithInstagram);
    console.log(`Filtered tactics list: ${JSON.stringify(text_tactics_list)}`);

    let flat_text_tactics_list: any[] = [];

    console.log("Text tactics list before flattening:", text_tactics_list);
    text_tactics_list.forEach((tactic: any) => {
        flat_text_tactics_list.push(...tactic.rows);
    });
    console.log("Text tactics list after flattening:", flat_text_tactics_list);
    
    const stable_text_tactics_list = flat_text_tactics_list;
    console.log(`Stable text tactics list: ${JSON.stringify(stable_text_tactics_list)}`);

    stable_text_tactics_list.forEach((tactic) => {
        console.log(`Checking tactic: ${JSON.stringify(tactic)}`);

        if (tactic.type === "includes") {
            console.log(`Checking 'includes' match for: ${tactic.search_term}`);
            if (new RegExp(`\\b${tactic.search_term.trim().toLowerCase()}\\b`).test(message.trim().toLowerCase())) {
                console.log(`'Includes' match found`);
                reply = tactic.message_to_send;
                delay = tactic.delay;
                console.log(`Match found with 'includes': reply=${reply}, delay=${delay}`);
                return;
            }
        } else if (tactic.type === "starts with") {
            console.log(`Checking 'starts with' match for: ${tactic.search_term}`);
            if (message.trim().toLowerCase().startsWith(tactic.search_term.trim().toLowerCase())) {
                console.log(`'Starts with' match found`);
                reply = tactic.message_to_send;
                delay = tactic.delay;
                console.log(`Match found with 'starts with': reply=${reply}, delay=${delay}`);
                return;
            }
        }
    });

    if (!reply && user?.aiSystemConfig.isOn) {
        console.log("No reply found, AI system is on - generating AI response");
        const instructions = `
        You are an instagram bot. Here are your instructions:
        ${user?.aiSystemConfig.instructions}
        Take into account the following message history:
        ${message_history}
        `
        console.log(`AI instructions: ${instructions}`);
        
        reply = await generateResponse(message, instructions || "Respond politely to this whatsapp message.");
        console.log(`AI generated reply: ${reply}`);
    }

    if (!reply) {
        respond_boolean = false;
        console.log("No match found, setting respond_boolean to false");
    }

    console.log(`Final reply: ${reply}, delay: ${delay}, respond_boolean: ${respond_boolean}`);

    return {reply, delay, respond_boolean: respond_boolean};
}
