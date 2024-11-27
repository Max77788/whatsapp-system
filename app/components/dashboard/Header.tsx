"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

interface HeaderProps {
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  const onLogout = () => {
    document.cookie = "loggedOut=true; path=/";
    signOut({
      callbackUrl: "/dashboard", // After logout, redirect here
    });
  };

  return (
    <header className="flex justify-between items-center p-4 bg-black rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-white">{userName}</h1>
      <div className="flex items-center gap-4">
        <button 
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-300 shadow hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;