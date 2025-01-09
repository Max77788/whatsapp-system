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
    <header className="flex justify-between items-center p-4 bg-black rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-white">{userName}</h1>
      <div className="flex items-center gap-4">
        <button 
          onClick={onLogout}
          className="px-5 py-2 text-sm font-medium text-white bg-green-800 hover:bg-green-900 rounded-full transition-colors duration-300 shadow hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {t('logout')}
        </button>
      </div>
    </header>
  );
};

export default Header;