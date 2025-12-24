
import React from 'react';
import { Shield, Book, Settings, Users } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'sos' | 'contacts' | 'directory' | 'settings';
  setActiveTab: (tab: 'sos' | 'contacts' | 'directory' | 'settings') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 overflow-hidden shadow-2xl border-x border-slate-200">
      <header className="bg-red-600 text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <h1 className="text-xl font-black tracking-tight uppercase">SafeGuard</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative">
        {children}
      </main>

      <nav className="bg-white border-t border-slate-200 flex justify-around p-3 pb-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {[
          { id: 'sos', icon: Shield, label: 'Help' },
          { id: 'directory', icon: Book, label: 'Helplines' },
          { id: 'contacts', icon: Users, label: 'Trusted' },
          { id: 'settings', icon: Settings, label: 'Settings' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-red-600' : 'text-slate-400'}`}
          >
            <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-red-50' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="bg-white pb-4 pt-1 text-center">
        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em]">Developed by Bibhu Mishra</p>
      </div>
    </div>
  );
};

export default Layout;
