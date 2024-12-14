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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#ff5e57' }}>{t("chatNotFound")}</h2>
        <p>{t("noChatExistsForTheGivenId")}: {chatId}</p>
      </div>
    );
  }

  return <ChatWindow chat={chat} />;
}
