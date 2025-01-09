"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CurrentSenderPhoneNumberState,
          useCurrentPhoneNumberStore
 } from "@/lib/store/chatStore";
import { toast } from "react-toastify";

export default function ChatWindow({ chat }: { chat: any }) {
  const t = useTranslations("waScreen");

  const senderPhoneNumber = useCurrentPhoneNumberStore(
    (state) => state.senderPhoneNumber
  );

  console.log("Sender phone number on ChatWindow:", senderPhoneNumber);
  
  const [message, setMessage] = useState("");

  const [mediaAttachment, setMediaAttachment] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setMediaAttachment(file);
    } else {
      setMediaAttachment(null);
    }
  };

  const clearFile = () => {
    setMediaAttachment(null);
  };

  const handleSendMessage = async () => {
    console.log("Sending message:", message, "from ", senderPhoneNumber);
    
    const toNumber = [chat.chatId.split("@")[0]]; 
    
    if (!message) {
      toast.error(t("messageCannotBeEmpty"));
      return;
    }

    console.log("Sending message to:", toNumber);

    const formData = new FormData();
    formData.append('toNumbers', JSON.stringify(toNumber));
    formData.append('message', message);
    formData.append('fromNumber', senderPhoneNumber);

    if (mediaAttachment) {
      formData.append('media', mediaAttachment);
    }

    const response = await fetch("/api/whatsapp-part/send-message", {
      method: "POST",
      body: formData,
    });

    location.reload();
  }
  
  console.log("Chat on wa/chatId:", chat);
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#ece5dd',
        padding: '10px',
        color: '#000000',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#075e54',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '10px 10px 0 0',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '18px' }}>{chat.name}</h2>
      </div>

      {/* Message Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '15px',
          backgroundColor: '#d9dbd4',
          borderRadius: '0 0 10px 10px',
        }}
      >
        {chat.messages.map((message: any) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems:
                message.from === chat.chatId ? 'flex-start' : 'flex-end', // Reverse alignment logic
              marginBottom: '15px',
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '10px 15px',
                borderRadius: '10px',
                backgroundColor:
                  message.from === chat.chatId ? 'white' : '#dcf8c6', // Reverse bubble color
                boxShadow: '0 2px 3px rgba(0, 0, 0, 0.2)',
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  wordWrap: 'break-word',
                }}
              >
                {message.body || (
                  <span style={{ color: '#888' }}>{t("noContent")}</span>
                )}
              </p>
              <small
                style={{
                  display: 'block',
                  marginTop: '5px',
                  fontSize: '10px',
                  color: '#888',
                  textAlign: 'right',
                }}
              >
                {new Date(message.timestamp * 1000).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </small>
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#fff',
    borderTop: '1px solid #ddd',
  }}
>
  {/* Attachment button icons (dummy placeholders) 
  <button
    style={{
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      marginRight: '10px',
      fontSize: '18px',
      color: '#888',
    }}
    onClick={() => alert('Show emojis or attachments')}
    title="Emojis/Attach"
  >
    + 
  </button>

  */}

  {/* Actual text input */}
  <input
    type="text"
    placeholder={t('typeMessage')}
    style={{
      flex: 1,
      border: 'none',
      borderRadius: '20px',
      backgroundColor: '#f0f0f0',
      padding: '10px 15px',
      fontSize: '14px',
      outline: 'none',
      marginRight: '10px',
    }}
    // Replace the following with your input logic
    onChange={(e) => setMessage(e.target.value)}
  />

<div className="relative inline-flex">
  {/* Label that looks like a pin */}
  <label
        htmlFor="file-upload"
        className="
          cursor-pointer 
          inline-flex 
          items-center 
          justify-center 
          rounded-full 
          border 
          border-gray-300 
          bg-white 
          text-gray-600
          hover:bg-gray-100 
          w-10 
          h-10
          mx-2

        "
        title="Upload File"
      >
        {/* Example of a pin/paperclip icon (Heroicons paperclip) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 00-5.656-5.656l-7.07 7.071" 
          />
        </svg>
        {/* Hidden input for file selection */}
        <input
          id="file-upload"
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* If there's a file, show a small red X at the top-right corner */}
      {mediaAttachment && (
          <button
            onClick={clearFile}
            className="
              absolute
              -top-2
              -right-2
              text-white
              bg-red-500
              rounded-full
              w-5
              h-5
              flex
              items-center
              justify-center
              text-xs
              hover:bg-red-600
              cursor-pointer
              border-2 
              border-white
            "
            title="Remove file"
          >
            x
          </button>
        )}
      </div>

  {/* Send / Mic icon (dummy placeholder) */}
  <button
    style={{
      border: 'none',
      backgroundColor: '#075e54',
      color: '#fff',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px',
    }}
    onClick={() => handleSendMessage()}
    title="Send"
  >
    ➤
  </button>
</div>

      
    </div>
  );
}
