import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  ChartLine, 
  Users, 
  Phone, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  MessageSquare, 
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { path: "/", icon: ChartLine, label: "Dashboard", roles: ["admin", "supervisor", "call-center", "field-agent"] },
  { path: "/leads", icon: Users, label: "Leads", roles: ["admin", "supervisor", "call-center", "field-agent"] },
  { path: "/calls", icon: Phone, label: "Calls", roles: ["admin", "supervisor", "call-center"] },
  { path: "/meetings", icon: Calendar, label: "Meetings", roles: ["admin", "supervisor", "call-center", "field-agent"] },
  { path: "/commissions", icon: DollarSign, label: "Commissions", roles: ["admin", "supervisor", "call-center", "field-agent"] },
  { path: "/analytics", icon: BarChart3, label: "Analytics", roles: ["admin", "supervisor"] },
  { path: "/settings", icon: Settings, label: "Settings", roles: ["admin", "supervisor"] }
];

export const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { currentUser, signOut } = useAuth();

  if (!currentUser) return null;

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      {/* Logo & Organization */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <ChartLine className="text-lg text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground" data-testid="text-organization">
              Sales Management
            </h2>
            <p className="text-sm text-muted-foreground capitalize" data-testid="text-user-role">
              {currentUser.role.replace("-", " ")}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2" data-testid="nav-menu">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <a 
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Chat Link */}
      <div className="px-4 py-2">
        <Link href="/chat">
          <a 
            className={cn(
              "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              location === "/chat"
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            data-testid="nav-chat"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chat</span>
          </a>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground" data-testid="text-user-initials">
              {currentUser.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
              {currentUser.name}
            </p>
            <p className="text-xs text-muted-foreground" data-testid="text-user-email">
              {currentUser.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-signout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
