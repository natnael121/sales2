import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./hooks/useAuth";
import { LoginModal } from "./components/auth/LoginModal";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Calls from "./pages/Calls";
import Meetings from "./pages/Meetings";
import Commissions from "./pages/Commissions";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/not-found";
import { useState, useEffect } from "react";

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      // Show login modal after a short delay to avoid flash
      const timer = setTimeout(() => {
        setShowLoginModal(true);
      }, 500);
      return () => clearTimeout(timer);
    } else if (currentUser) {
      setShowLoginModal(false);
    }
  }, [currentUser, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Sales Management System</h1>
            <p className="text-muted-foreground">Please sign in to continue</p>
          </div>
        </div>
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/leads" component={Leads} />
      <Route path="/calls" component={Calls} />
      <Route path="/meetings" component={Meetings} />
      <Route path="/commissions" component={Commissions} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
