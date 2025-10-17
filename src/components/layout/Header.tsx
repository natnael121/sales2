import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../hooks/useAuth";
import { Bell, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onQuickAction?: () => void;
  quickActionLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  onQuickAction,
  quickActionLabel = "Quick Action"
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-page-subtitle">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2 text-muted-foreground hover:text-foreground relative"
            data-testid="button-notifications"
          >
            <Bell className="text-lg" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs"></span>
          </Button>
          {onQuickAction && (
            <Button 
              onClick={onQuickAction}
              className="px-4 py-2 font-medium"
              data-testid="button-quick-action"
            >
              <Plus className="mr-2 w-4 h-4" />
              {quickActionLabel}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
