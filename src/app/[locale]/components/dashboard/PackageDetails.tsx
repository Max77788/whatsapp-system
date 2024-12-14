// components/PackageDetails.js
"use client";
import { commonStyles } from "./SentMessagesTracker";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

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

export default function PackageDetails() {
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const currentLocale = useLocale();
  const t = useTranslations("dashboard");
  
  useEffect(() => {
    async function fetchPlan() {
      try {
        const response = await fetch("/api/plan/find-plan", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setPlan(data);
      } catch (err: any) {
        setError(err.message);
      }
    }

    fetchPlan();
  }, []);

  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>{t('error')}</h2>
        <p style={styles.detailItem}>{error}</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={{ ...commonStyles }}>
      <h2 style={styles.header}>📦 {t('packageDetails')}</h2>
      <div style={styles.details}>
        <p style={styles.detailItem}>
          <strong>{t('package')}:</strong>
        </p>
        <p style={styles.detailItem}>
          <strong>{t('aiIncluded')}:</strong>
        </p>
        <p style={styles.detailItem}>
          <strong>{t('maximumWhatsAppAccounts')}:</strong> 
        </p>
        <p style={styles.detailItem}>
          <strong>{t('messagesPerMonth')}:</strong> 
        </p>
        <p style={styles.detailItem}>
          <strong>{t('price')}:</strong> NIS
        </p>
      </div>
    </div>
    );
  }
  
  return (
    <div style={{ ...commonStyles }}>
      <h2 style={styles.header}>📦 {t('packageDetails')}</h2>
      <div style={styles.details}>
        <p style={styles.detailItem}>
          <strong>{t('package')}:</strong> {plan.name}
        </p>
        <p style={styles.detailItem}>
          <strong>{t('aiIncluded')}:</strong> {plan?.aiIncluded ? t('yes') : t('no')}
        </p>
        <p style={styles.detailItem}>
          <strong>{t('maximumWhatsAppAccounts')}:</strong> {plan?.maxWaAccsNumber ? plan?.maxWaAccsNumber : t('unlimited')}
        </p>
        <p style={styles.detailItem}>
          <strong>{t('messagesPerMonth')}:</strong> {plan?.messageLimit ? plan?.messageLimit : t('unlimited')}
        </p>
        <p style={styles.detailItem}>
          <strong>{t('price')}:</strong> {plan.price} {t('nis')}
        </p>
      </div>
    </div>
  );
}
