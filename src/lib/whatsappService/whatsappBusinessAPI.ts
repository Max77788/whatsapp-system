import axios from 'axios';

/**
 * WhatsApp Business Cloud API Service
 * 
 * This service provides methods to interact with the WhatsApp Business Cloud API.
 * Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
export class WhatsAppBusinessService {
    private phoneNumberId: string;
    private accessToken: string;
    private apiVersion: string;
    private baseUrl: string;

    constructor(phoneNumberId: string, accessToken: string, apiVersion: string = 'v21.0') {
        this.phoneNumberId = phoneNumberId;
        this.accessToken = accessToken;
        this.apiVersion = apiVersion;
        this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    }

    /**
     * Send a WhatsApp message
     * 
     * @param to - Recipient's phone number
     * @param message - Message text (for text messages)
     * @param mediaUrl - URL of media to send (for media messages)
     * @param templateName - Name of the template to use (for template messages)
     * @param templateLanguage - Language code for the template (default: 'en')
     * @param templateComponents - Components for the template
     * @returns API response
     */
    async sendMessage(to: string, message: string, mediaUrl?: string, templateName?: string, templateLanguage?: string, templateComponents?: any[]) {
        try {
            let messageData: any = {
                messaging_product: 'whatsapp',
                to,
                recipient_type: 'individual',
            };

            if (templateName) {
                // Template message
                messageData.type = 'template';
                messageData.template = {
                    name: templateName,
                    language: {
                        code: templateLanguage || 'en'
                    }
                };
                if (templateComponents) {
                    messageData.template.components = templateComponents;
                }
            } else if (mediaUrl) {
                // Media message
                messageData.type = 'image';
                messageData.image = {
                    link: mediaUrl
                };
            } else {
                // Text message
                messageData.type = 'text';
                messageData.text = {
                    body: message,
                    preview_url: false // Disable link previews by default
                };
            }

            const response = await axios.post(
                `${this.baseUrl}/${this.phoneNumberId}/messages`,
                messageData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error sending WhatsApp message:', error.response?.data || error);
            throw new Error(error.response?.data?.error?.message || 'Failed to send message');
        }
    }

    /**
     * Get messages for a specific phone number
     * 
     * @param phoneNumber - Phone number to get messages for
     * @param limit - Maximum number of messages to return (default: 50)
     * @returns API response
     */
    // TODO this functionality can only be used through webhooks
    // async getMessages(phoneNumber: string, limit: number = 50) {
    //     try {
    //         const response = await axios.get(
    //             `${this.baseUrl}/${this.phoneNumberId}/messages`,
    //             {
    //                 params: {
    //                     phone_number: phoneNumber,
    //                     limit
    //                 },
    //                 headers: {
    //                     'Authorization': `Bearer ${this.accessToken}`
    //                 }
    //             }
    //         );

    //         return response.data;
    //     } catch (error: any) {
    //         console.error('Error fetching WhatsApp messages:', error.response?.data || error);
    //         throw new Error(error.response?.data?.error?.message || 'Failed to fetch messages');
    //     }
    // }


    /**
     * Get message templates
     * 
     * @returns API response
     */
    // async getMessageTemplates() {
    //     try {
    //         const response = await axios.get(
    //             `${this.baseUrl}/${this.phoneNumberId}/message_templates`,
    //             {
    //                 headers: {
    //                     'Authorization': `Bearer ${this.accessToken}`
    //                 }
    //             }
    //         );

    //         return response.data;
    //     } catch (error: any) {
    //         console.error('Error fetching message templates:', error.response?.data || error);
    //         throw new Error(error.response?.data?.error?.message || 'Failed to fetch message templates');
    //     }
    // }

    /**
     * Create a message template
     * 
     * @param name - Template name
     * @param language - Template language code
     * @param category - Template category (AUTHENTICATION, MARKETING, UTILITY)
     * @param components - Template components
     * @returns API response
     */
    // ⚠️ available only via WhatsApp Business Manager UI or Meta Graph API with special permissions.
    async createMessageTemplate(name: string, language: string, category: string, components: any[]) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/${this.phoneNumberId}/message_templates`,
                {
                    name,
                    language,
                    category,
                    components
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error creating message template:', error.response?.data || error);
            throw new Error(error.response?.data?.error?.message || 'Failed to create message template');
        }
    }

    /**
     * Delete a message template
     * 
     * @param name - Template name to delete
     * @returns API response
     */
    // ⚠️ available only via WhatsApp Business Manager UI or Meta Graph API with special permissions.
    // 
    async deleteMessageTemplate(name: string) {
        try {
            const response = await axios.delete(
                `${this.baseUrl}/${this.phoneNumberId}/message_templates`,
                {
                    data: {
                        name
                    },
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Error deleting message template:', error.response?.data || error);
            throw new Error(error.response?.data?.error?.message || 'Failed to delete message template');
        }
    }


}

/**
 * Initialize the WhatsApp Business API service
 * 
 * @returns WhatsAppBusinessService instance
 */
export async function initializeWhatsAppService() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';

    if (!phoneNumberId || !accessToken) {
        throw new Error('WhatsApp Business API credentials not configured');
    }

    return new WhatsAppBusinessService(phoneNumberId, accessToken, apiVersion);
} 