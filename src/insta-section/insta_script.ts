import { IgApiClient } from 'instagram-private-api';

export async function insta_script(IG_USERNAME: string, IG_PASSWORD: string, text_tactics: {[key: string | number]: any}[]) {
  const ig = new IgApiClient();

  // Login to your Instagram account
  ig.state.generateDevice(IG_USERNAME);
  const loggedInUser = await ig.account.login(IG_USERNAME, IG_PASSWORD);

  // Logged-in user's ID
  const loggedInUserId = loggedInUser.pk;

  // Listen to incoming direct messages
  const inbox = await ig.feed.directInbox().items();

  // Iterate over each message
  for (const conversation of inbox) {
    const messages = conversation.items;
    const messageCount = messages.length;

    for (const message of messages) {
      const userId = message.user_id;
      const text = message.text;

      const thread = ig.entity.directThread([userId.toString()]);

      // Check for the keyword in the message
      if (message.item_type === 'text' && text?.toLowerCase() === 'hello') {
        console.log(`Keyword detected in message: "${message.text}"`);

        // Send an automated reply
        await thread.broadcastText('Hi there! How can I help you?');
        console.log('Automated reply sent');
      }
    }
  }
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
