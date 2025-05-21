import { WhatsAppBusinessService, initializeWhatsAppService } from '../whatsappService/whatsappBusinessAPI';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mock axios
jest.mock('axios');

describe('WhatsAppBusinessService', () => {
    let service: WhatsAppBusinessService;
    const mockPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '123456789';
    const mockAccessToken = process.env.WHATSAPP_ACCESS_TOKEN || 'test-access-token';
    const mockApiVersion = process.env.WHATSAPP_API_VERSION || 'v22.0';


    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Create a new instance of the service for each test
        service = new WhatsAppBusinessService(mockPhoneNumberId, mockAccessToken, mockApiVersion);
    });

    describe('sendMessage', () => {
        it('should send a text message successfully', async () => {
            const mockResponse = { data: { message_id: '123' } };
            (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await service.sendMessage('+2347050595335', 'Hello, World!');

            expect(axios.post).toHaveBeenCalledWith(
                `https://graph.facebook.com/${mockApiVersion}/${mockPhoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: '+2347050595335',
                    recipient_type: 'individual',
                    type: 'text',
                    text: {
                        body: 'Hello, World!',
                        preview_url: false
                    }
                    // type: "template",
                    // template: {
                    //     name: "hello_world",
                    //     "language": { "code": "en_US" }
                    // }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${mockAccessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should send a media message successfully', async () => {
            const mockResponse = { data: { message_id: '123' } };
            (axios.post as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await service.sendMessage('+2347050595335', 'Just a test', 'https://picsum.photos/seed/picsum/200/300');

            expect(axios.post).toHaveBeenCalledWith(
                `https://graph.facebook.com/${mockApiVersion}/${mockPhoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: '+2347050595335',
                    recipient_type: 'individual',
                    type: 'image',
                    image: {
                        link: 'https://picsum.photos/seed/picsum/200/300'
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${mockAccessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle API errors gracefully', async () => {
            const mockError = {
                response: {
                    data: {
                        error: {
                            message: 'Invalid phone number'
                        }
                    }
                }
            };
            (axios.post as jest.Mock).mockRejectedValueOnce(mockError);

            await expect(service.sendMessage('invalid', 'Hello'))
                .rejects
                .toThrow('Invalid phone number');
        });
    });

});

describe('initializeWhatsAppService', () => {
    it('should initialize service with environment variables', async () => {
        const service = await initializeWhatsAppService();
        expect(service).toBeInstanceOf(WhatsAppBusinessService);
    });

    it('should throw error when credentials are missing', async () => {
        const originalEnv = process.env;
        process.env = { ...originalEnv };
        delete process.env.WHATSAPP_PHONE_NUMBER_ID;

        await expect(initializeWhatsAppService()).rejects.toThrow('WhatsApp Business API credentials not configured');

        process.env = originalEnv;
    });
});