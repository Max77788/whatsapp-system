'use client';

import SidebarChat from './components/SidebarChat';
import SidebarNoText from '../components/whatsapp-screen/SidebarNoText';
export default function ChatLayout({ children, params }: { children: React.ReactNode, params: any }) {
  
   return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f0f0' }}>
      {/* Sidebar */}
      <div style={{ backgroundColor: '#000000', borderRight: '1px solid #ccc', overflowY: 'auto', display: 'flex', flexDirection: 'row' }}>
        <SidebarNoText />
        <SidebarChat />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#ece5dd' }}>
        {children}
      </div>
    </div>
  );
}
  