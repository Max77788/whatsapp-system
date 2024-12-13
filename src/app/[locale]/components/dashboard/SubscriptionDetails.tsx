// components/SubscriptionDetails.js
"use client";
import { commonStyles } from "./SentMessagesTracker";
import { useEffect, useState } from "react";

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

export default function SubscriptionDetails() {
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const planData = await fetch("/api/plan/find-plan");
        const plan = await planData.json();
        setPlan(plan);
      } catch (err: any) {
      setError(err.message);
    }
  }

  fetchPlan();
}, []);

  let renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + 1);
  
  // Conditional rendering
  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>Error</h2>
        <p style={styles.detailItem}>{error}</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ ...commonStyles }}>
      <h2 style={styles.header}>📜 Subscription Details</h2>
      <div style={styles.details}>
        <p style={styles.detailItem}>
          <strong>Plan:</strong>
        </p>
        <p style={styles.detailItem}>
          <strong>Status:</strong> Active
        </p>
        <p style={styles.detailItem}>
          <strong>Renewal Date:</strong> {renewalDate.toLocaleDateString()}
        </p>
      </div>
    </div>
    );
  }

  return (
    <div style={{ ...commonStyles }}>
      <h2 style={styles.header}>📜 Subscription Details</h2>
      <div style={styles.details}>
        <p style={styles.detailItem}>
          <strong>Plan:</strong> {plan.name}
        </p>
        <p style={styles.detailItem}>
          <strong>Status:</strong> Active
        </p>
        <p style={styles.detailItem}>
          <strong>Renewal Date:</strong> {renewalDate.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
