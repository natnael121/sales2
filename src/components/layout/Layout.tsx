import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  onQuickAction?: () => void;
  quickActionLabel?: string;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  onQuickAction,
  quickActionLabel 
}) => {
  return (
    <div className="flex h-screen bg-background" data-testid="layout">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={title} 
          subtitle={subtitle} 
          onQuickAction={onQuickAction}
          quickActionLabel={quickActionLabel}
        />
        <main className="flex-1 overflow-auto p-6" data-testid="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};
