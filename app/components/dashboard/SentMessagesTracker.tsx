"use client";

export const commonStyles: React.CSSProperties = {
  width: "650px", // Set a consistent width
  height: "430px", // Set a consistent height
  margin: "20px auto",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  backgroundColor: "#f9f9f9",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  fontFamily: "'Arial', sans-serif",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};


const styles: { container: React.CSSProperties; number: React.CSSProperties; header: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    fontFamily: "'Arial', sans-serif",
    maxWidth: "400px",
  },
  number: {
    fontSize: "5rem",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  header: {
    fontSize: "2.2rem",
    color: "#333",
    textAlign: "center",
  },
};

interface SentMessagesTrackerProps {
  sentMessages: number; // Changed to `number` for better type safety
}

export default function SentMessagesTracker({ sentMessages }: SentMessagesTrackerProps) {
  return (
    <div style={{ ...commonStyles }}>
      <h2 style={styles.header}>📢 Sent Messages</h2>
      <span style={styles.number}>{sentMessages}</span>
    </div>
  );
}


  