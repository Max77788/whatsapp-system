// components/PackageDetails.js
"use client";
import { commonStyles } from "./SentMessagesTracker";

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
    fontSize: "2.2rem",
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

export default async function PackageDetails() {

  const planData = await fetch("/api/plan/find-plan");

  const plan = await planData.json();
  
  return (
    <div style={{ ...commonStyles }}>
      <h2 style={styles.header}>📦 Package Details</h2>
      <div style={styles.details}>
        <p style={styles.detailItem}>
          <strong>Package:</strong> {plan.name}
        </p>
        <p style={styles.detailItem}>
          <strong>AI Included:</strong> {plan?.aiIncluded ? "Yes" : "No"}
        </p>
        <p style={styles.detailItem}>
          <strong>Maximum WhatsApp Accounts:</strong> {plan?.maxWaAccsNumber ? plan?.maxWaAccsNumber : "Unlimited"}
        </p>
        <p style={styles.detailItem}>
          <strong>Messages per Month:</strong> {plan?.messageLimit ? plan?.messageLimit : "Unlimited"}
        </p>
        <p style={styles.detailItem}>
          <strong>Price:</strong> {plan.price} NIS
        </p>
      </div>
    </div>
  );
}
