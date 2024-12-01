import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateResponse(prompt: string): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    return completion.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response');
  }
}

export async function generateChatResponse(messages: Array<{ role: string, content: string }>): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as ChatCompletionMessageParam[],
    });

    return completion.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate chat response');
  }
}

