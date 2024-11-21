// Import the data and ChatWindow component
import { data } from '../components/mockdata';
import ChatWindow from '../components/ChatWindow';

const fetchData = async () => {
  return data;
};

export default async function ChatRoomPage({ params }: { params: { chatId: string } }) {
  // Decode and extract chatId from params
  const chatId = decodeURIComponent(params.chatId);

  // Find the chat by chatId
  const chat = data.find((c) => c.chatId === chatId);

  if (!chat) {
    // Handle case where chat is not found
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#ff5e57' }}>Chat Not Found</h2>
        <p>No chat exists for the given ID: {chatId}</p>
      </div>
    );
  }

  // If chat is found, render the ChatWindow
  return <ChatWindow chat={chat} />;
}
