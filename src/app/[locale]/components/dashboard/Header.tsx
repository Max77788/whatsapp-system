"use client";

import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

interface HeaderProps {
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  const currentLocale = useLocale();
  const t = useTranslations('dashboard');

  const onLogout = () => {
    document.cookie = "loggedOut=true; path=/";
    signOut({
      callbackUrl: `/${currentLocale}/dashboard`, // After logout, redirect here
    });
  };

  return (
    <header className="flex justify-between items-center mb-4 p-4 bg-black rounded-lg shadow-[0px_10px_15px_rgba(0,0,0,0.8)]">

      <h1 className="text-2xl font-bold text-white">{userName}</h1>
      <div className="flex items-center gap-4">
        <button 
          onClick={onLogout}
          className="px-5 py-2 text-sm font-medium text-white bg-green-700 hover:bg-green-800 rounded-full transition-colors duration-300 shadow hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <b>{t('logout')}🏃‍♂️‍➡️</b>
        </button>
      </div>
    </header>
  );
};

export default Header;