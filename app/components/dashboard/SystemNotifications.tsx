// components/SystemNotifications.js
"use client";

const styles: { container: React.CSSProperties; header: React.CSSProperties; list: React.CSSProperties; item: React.CSSProperties; itemHover: React.CSSProperties } = {
  container: {
    maxWidth: "600px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    fontFamily: "'Arial', sans-serif",
  },
  header: {
    color: "#333",
    marginBottom: "15px",
    fontSize: "1.5rem",
    textAlign: "center",
  },
  list: {
    listStyle: "none",
    padding: "0",
    margin: "0",
  },
  item: {
    backgroundColor: "#fff",
    padding: "10px 15px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    transition: "background-color 0.3s ease",
    color: "#555",
  },
  itemHover: {
    backgroundColor: "#f0f8ff",
  },
};

export default function SystemNotifications() {
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📢 System Notifications & Alerts</h2>
      <ul style={styles.list}>
        <li style={styles.item}>
          <strong>Alert:</strong> System maintenance scheduled for tomorrow.
        </li>
        <li style={styles.item}>
          <strong>Notification:</strong> New update available!
        </li>
        <li style={styles.item}>
          <strong>Reminder:</strong> Check your account security settings.
        </li>
      </ul>
    </div>
  );
}

  