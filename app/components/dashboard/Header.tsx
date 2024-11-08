"use client";
import { signOut } from "next-auth/react";

/*
// components/Header.tsx
interface HeaderProps {
  userName?: string;
  onLogout?: () => void;
}
*/

const Header = () => {
  const onLogout = () => {
    signOut({
      callbackUrl: "/auth/signin?notification=loggedOut", // After logout, redirect here
    });
  };

  return (
    <header className="header">
      <h1>Dashboard</h1>
      <div className="user-info">
        <span>Welcome, User!</span>
        <button onClick={onLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;

  