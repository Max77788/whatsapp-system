require('dotenv').config();
const axios = require('axios');
const { initializeWhatsAppService } = require('./src/lib/whatsappService/whatsappBusinessAPI');

/**
 * Test script for WhatsApp Business API
 * 
 * This script demonstrates how to use the WhatsApp Business API to:
 * 1. Send text messages
 * 2. Send media messages
 * 3. Fetch messages from a chat
 * 4. Get chat information
 * 5. Get contact information
 */

// Mock user object with necessary credentials
const mockUser = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  email: 'test@example.com'
};

// Test phone number to send messages to
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '1234567890';

async function runTests() {
  try {
    console.log('Initializing WhatsApp Business API service...');
    const whatsappService = await initializeWhatsAppService();
    
    // Test 1: Send a text message
    console.log('\n--- Test 1: Sending a text message ---');
    const messageText = 'Hello from WhatsApp Business API test!';
    const messageResult = await whatsappService.sendMessage(TEST_PHONE_NUMBER, messageText);
    console.log('Message sent successfully:', messageResult);
    
    // Test 2: Send a media message (if media URL is provided)
    if (process.env.TEST_MEDIA_URL) {
      console.log('\n--- Test 2: Sending a media message ---');
      const mediaMessage = 'Check out this media!';
      const mediaResult = await whatsappService.sendMessage(
        TEST_PHONE_NUMBER, 
        mediaMessage, 
        process.env.TEST_MEDIA_URL
      );
      console.log('Media message sent successfully:', mediaResult);
    }
    
    // Test 3: Get messages from a chat
    console.log('\n--- Test 3: Getting messages from a chat ---');
    const messages = await whatsappService.getMessages(TEST_PHONE_NUMBER);
    console.log('Messages retrieved:', messages);
    
    // Test 4: Get chat information
    console.log('\n--- Test 4: Getting chat information ---');
    const chats = await whatsappService.getChats();
    console.log('Chats retrieved:', chats);
    
    // Test 5: Get contact information
    console.log('\n--- Test 5: Getting contact information ---');
    const contactInfo = await whatsappService.getContactInfo(TEST_PHONE_NUMBER);
    console.log('Contact information retrieved:', contactInfo);
    
    // Test 6: Get message templates
    console.log('\n--- Test 6: Getting message templates ---');
    const templates = await whatsappService.getMessageTemplates();
    console.log('Message templates retrieved:', templates);
    
    console.log('\nAll tests completed successfully!');
    
  } catch (error) {
    console.error('Error during testing:', error);
    process.exit(1);
  }
}

// Run the tests
runTests(); 