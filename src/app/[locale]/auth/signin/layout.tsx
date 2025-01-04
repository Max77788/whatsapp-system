"use server";

import { useLocale, useTranslations } from 'next-intl';
import React from 'react';

const SignInLayout = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations('signin');
  const currentLocale = useLocale();

  return (
    <div className="flex h-screen">

      {/* Left Section - Login Form */}
      <div className="flex flex-col items-center justify-center w-full max-w-md p-8 shadow-md bg-black rounded-2xl">
      <div className="flex items-center mb-8">
        <svg
          className="w-12 h-12 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <a href={`/${currentLocale}/dashboard`} className="no-underline">
          <h2 className="text-4xl text-white font-bold">Bumby</h2>
        </a>
      </div>
        <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold mb-4 text-black">{t('signIn')}</h1>
            <p className="text-lg text-gray-600 mb-3">{t('pleaseSignInToContinue')}</p>
            
            <div className="flex items-center justify-center">{children}</div>
        </div>
      </div>
      
      {/* Right Section - Image */}
      <div className="hidden md:flex flex-1 bg-teal-500 items-center justify-center">
        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('/static/green-black-background.jpeg')" }}></div>
      </div>

      
    </div>
  );
};

export default SignInLayout;
