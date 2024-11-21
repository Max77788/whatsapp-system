"use client";

// components/Sidebar.tsx
import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="w-200 p-5 bg-black mb-2 mt-2 rounded-lg">
      <div className="flex items-center mb-8">
        
        <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <a href="/dashboard" className="no-underline">
          <h2 className="text-xl text-white font-bold">WhatsLeads</h2>
        </a>
      </div>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link href="/dashboard" className="flex items-center p-3 rounded-lg bg-white hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/settings" className="flex items-center p-3 rounded-lg bg-white hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Settings
            </Link>
          </li>
          <li>
            <Link href="/profile" className="flex items-center p-3 rounded-lg bg-white hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Profile
            </Link>
          </li>
          <li>
            <Link href="/send-message" className="flex items-center p-3 rounded-lg bg-white hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.5 19.5L21 12 2.5 4.5 2.5 10.5 17 12 2.5 13.5z"/>
              </svg>
              Send Message
            </Link>
          </li>

          {/*         
          <li>
            <Link href="/send-message" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.5 19.5L21 12 2.5 4.5 2.5 10.5 17 12 2.5 13.5z"/>
              </svg>
              Video Tutorials
            </Link>
          </li>
          */}
          <li>
            <Link href="/webhooks-setup" className="flex items-center p-3 rounded-lg bg-white hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.59 5.58L20 12l-8-8-8 8z"/>
              </svg>
              Webhooks
            </Link>
          </li>

          <hr></hr>

          <li>
            <Link href="/whatsapp-screen" target="_blank" className="flex items-center p-3 rounded-lg bg-white hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 0 5.37 0 12c0 2.12.55 4.15 1.6 5.95L0 24l6.18-1.62A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.23-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.2-1.45l-.37-.22-3.65.96.98-3.56-.24-.37A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.27-7.73c-.29-.15-1.71-.84-1.98-.94-.27-.1-.47-.15-.67.15-.2.29-.77.94-.95 1.13-.18.2-.35.22-.64.07-.29-.15-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.18.2-.29.29-.48.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.22-.24-.58-.48-.5-.67-.51-.18-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.29-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.11 3.22 5.12 4.52.71.31 1.27.5 1.7.64.71.23 1.35.2 1.86.12.57-.08 1.71-.7 1.95-1.37.24-.67.24-1.25.17-1.37-.07-.12-.27-.2-.57-.35z"/>
              </svg>
              Whatsapp Screen
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
