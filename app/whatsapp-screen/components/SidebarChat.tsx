'use client';

import { data } from './mockdata';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Chats</h2>
      <ul style={{ listStyle: 'none', padding: '0' }}>
        {data.map((chat: any) => (
          <li
            key={chat.chatId}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 5px',
              cursor: 'pointer',
              borderBottom: '1px solid #ddd',
            }}
            onClick={() => router.push(`/whatsapp-screen/${chat.chatId}`)}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#ccc',
                borderRadius: '50%',
                marginRight: '10px',
              }}
            ></div>
            <span>{chat.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
