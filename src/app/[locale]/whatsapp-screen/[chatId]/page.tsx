'use client';

import { useChatStore } from '@/lib/store/chatStore';
import ChatWindow from '../components/ChatWindow';
import { ChatStore } from '@/lib/store/chatStore';

export default function ChatRoomPage({ params }: { params: any }) {
  console.log("Params on wa/chatId:", params);
  
  const { chats } = useChatStore() as ChatStore;
  
  console.log("Chats on wa/chatId:", chats);

  const chatId = decodeURIComponent(params.chatId);

  const chat = chats.find((c) => c.chatId === chatId);

  if (!chat) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#ff5e57' }}>Chat Not Found</h2>
        <p>No chat exists for the given ID: {chatId}</p>
      </div>
    );
  }

  return <ChatWindow chat={chat} />;
}
