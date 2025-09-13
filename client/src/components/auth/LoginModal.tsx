import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/use-toast";
import { ChartLine } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      onClose();
      toast({
        title: "Success",
        description: "You have been signed in successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" data-testid="login-modal">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <ChartLine className="text-2xl text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sales Management System</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                data-testid="input-email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                data-testid="input-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
              data-testid="button-signin"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center">
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot your password?
              </a>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Demo Roles: Admin, Supervisor, Call Center Agent, Field Agent
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
