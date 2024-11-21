'use client';

import SidebarChat from './components/SidebarChat';

export default async function ChatLayout({ children, params }: { children: React.ReactNode, params: any }) {
  
   return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f0f0' }}>
      {/* Sidebar */}
      <div style={{ width: '30%', backgroundColor: '#ffffff', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
        <SidebarChat />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
  