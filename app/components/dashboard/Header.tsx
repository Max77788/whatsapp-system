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
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      <h1 className="text-2xl font-bold text-gray-800">{userName}</h1>
      <div className="flex items-center gap-4">
        <button 
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;