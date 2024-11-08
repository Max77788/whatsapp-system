"use client";

// components/Header.tsx
const Header = () => {
    return (
      <header className="header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Welcome, User!</span>
          <button>Logout</button>
        </div>
      </header>
    );
  };
  
export default Header;
  