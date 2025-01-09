'use client';
import React, { JSX } from 'react';
import { useChatStore } from '@/lib/store/chatStore';
import ChatWindow from '../components/ChatWindow';
import { ChatStore } from '@/lib/store/chatStore';
import { useTranslations } from 'next-intl';

export default function ChatRoomPage({ params }: { params: any }) {
  
  const t = useTranslations("waScreen");
  
  const { chats } = useChatStore() as ChatStore;

  const chatId = decodeURIComponent(params.chatId);

  const chat = chats.find((c) => c.chatId === chatId);

  if (!chat) {

    console.log("Chat not found on wa/chatId:", chat);
    return (
        <div className="flex items-center justify-center h-screen">
          {/* Centered horizontally and vertically, no extra background container */}
          <div className="flex items-center text-center">
            <svg
              className="w-16 h-16 mr-4" // Make the logo bigger
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-4xl font-bold text-black">Bumby</h2>
          </div>
        </div>
      );
    }

  return <ChatWindow chat={chat} />;
}
