"use client";

// components/Sidebar.tsx
import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Logo</h2>
      <nav>
        <ul>
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link href="/settings">Settings</Link>
          </li>
          <li>
            <Link href="/profile">Profile</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
