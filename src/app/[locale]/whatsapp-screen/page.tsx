'use server';

import { getTranslations } from 'next-intl/server';

export default async function ChatPage() {
    const t = await getTranslations("waScreen");

    return (
      <div style={{ padding: '20px', color: '#000000', backgroundColor: '#ece5dd' }}>
        <h2>{t("welcomeToWhatsAppScreen")}</h2>
        <p>{t("selectAchatFromTheSidebarToStartMessaging")}</p>
      </div>
    );
  }
  