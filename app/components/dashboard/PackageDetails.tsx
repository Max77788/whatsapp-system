// components/PackageDetails.js
"use client";

const styles: {
  container: React.CSSProperties;
  header: React.CSSProperties;
  details: React.CSSProperties;
  detailItem: React.CSSProperties;
} = {
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
  details: {
    lineHeight: "1.8",
    margin: "0",
    padding: "0",
  },
  detailItem: {
    backgroundColor: "#fff",
    padding: "10px 15px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    color: "#555",
  },
};

export default function PackageDetails() {
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📦 Package Details</h2>
      <div style={styles.details}>
        <p style={styles.detailItem}>
          <strong>Package:</strong> 7-days Free Trial
        </p>
        <p style={styles.detailItem}>
          <strong>Features:</strong> 10 messages/day, 35 scheduled messages/week, no AI included!
        </p>
        <p style={styles.detailItem}>
          <strong>Price:</strong> FREE
        </p>
      </div>
    </div>
  );
}
