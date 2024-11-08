"use client";

/*
// components/Header.tsx
interface HeaderProps {
  userName?: string;
  onLogout?: () => void;
}
*/

const Header = () => {
    const onLogout = () => {
        console.log("Logout");
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
  