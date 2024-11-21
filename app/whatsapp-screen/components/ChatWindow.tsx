export default function ChatWindow({ chat }: { chat: any }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#ece5dd',
        padding: '10px',
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
                  <span style={{ color: '#888' }}>No content</span>
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

      {/* Input Box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#fff',
          borderTop: '1px solid #ddd',
        }}
      >
        <input
          type="text"
          placeholder="Type a message"
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '14px',
            borderRadius: '20px',
            border: '1px solid #ddd',
            outline: 'none',
          }}
        />
        <button
          style={{
            marginLeft: '10px',
            backgroundColor: '#075e54',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '10px 15px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
