'use server';

import { getTranslations } from 'next-intl/server';

export default async function ChatPage() {
    const t = await getTranslations("waScreen");

    return (
      <div style={{ padding: '20px', color: '#000000', backgroundColor: '#ece5dd' }}>

        <div className="flex flex-col items-center justify-center gap-2 h-screen">
          {/* Centered horizontally and vertically, no extra background container */}
          <div className="flex items-center flex-direction text-center">
            <svg
              className="w-16 h-16 mr-4" // Make the logo bigger
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-4xl font-bold text-black">Bumby</h2>
          </div>
          <div className="text-center">
             <h2 className="font-bold italic underline text-2xl">{t("welcomeToWhatsAppScreen")}</h2>
             <p className="font-bold italic underline text-xl">{t("selectAchatFromTheSidebarToStartMessaging")}</p>
          </div>
        </div>  
        
      </div>
    );
  }
  