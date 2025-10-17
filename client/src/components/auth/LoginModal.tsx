import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/use-toast";
import { ChartLine, Users, Settings } from "lucide-react";
import { createDemoData, DEMO_CREDENTIALS } from "../../lib/demo-setup";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
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
      console.error("Sign in error:", error);
      
      let errorMessage = "Failed to sign in";
      if (error.message?.includes("permission-denied") || error.code === "permission-denied") {
        errorMessage = "Firebase security rules need to be configured. Please see setup instructions below.";
      } else if (error.message?.includes("user-not-found") || error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email. Try setting up demo data first.";
      } else if (error.message?.includes("wrong-password") || error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Try demo credentials or reset your password.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSetup = async () => {
    setDemoLoading(true);
    try {
      await createDemoData();
      toast({
        title: "Demo Data Created",
        description: "Demo organization and users have been created successfully!",
      });
    } catch (error: any) {
      console.error("Demo setup error:", error);
      let errorMessage = "Failed to create demo data";
      if (error.message?.includes("permission-denied")) {
        errorMessage = "Firebase security rules need to be configured first. Please follow the setup instructions.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Demo Setup Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDemoLoading(false);
    }
  };

  const handleDemoLogin = async (role: keyof typeof DEMO_CREDENTIALS) => {
    const credentials = DEMO_CREDENTIALS[role];
    setEmail(credentials.email);
    setPassword(credentials.password);
    
    // Auto-submit after setting credentials
    setLoading(true);
    try {
      await signIn(credentials.email, credentials.password);
      onClose();
      toast({
        title: "Success",
        description: `Signed in as ${role} user successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Demo Login Failed",
        description: error.message || "Failed to sign in with demo credentials",
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

          {/* Demo Setup Section */}
          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div className="text-center">
              <Button
                onClick={handleDemoSetup}
                disabled={demoLoading}
                variant="outline"
                className="w-full"
                data-testid="button-setup-demo"
              >
                <Settings className="mr-2 w-4 h-4" />
                {demoLoading ? "Setting up..." : "Setup Demo Data"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Creates demo organization and users for testing
              </p>
            </div>
            
            {/* Demo Login Buttons */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground text-center">Quick Demo Login:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleDemoLogin("admin")}
                  disabled={loading}
                  variant="secondary" 
                  size="sm"
                  data-testid="button-demo-admin"
                >
                  Admin
                </Button>
                <Button
                  onClick={() => handleDemoLogin("supervisor")}
                  disabled={loading}
                  variant="secondary"
                  size="sm" 
                  data-testid="button-demo-supervisor"
                >
                  Supervisor
                </Button>
                <Button
                  onClick={() => handleDemoLogin("agent")}
                  disabled={loading}
                  variant="secondary"
                  size="sm"
                  data-testid="button-demo-agent"
                >
                  Call Agent
                </Button>
                <Button
                  onClick={() => handleDemoLogin("field")}
                  disabled={loading}
                  variant="secondary"
                  size="sm"
                  data-testid="button-demo-field"
                >
                  Field Agent
                </Button>
              </div>
            </div>

            {/* Firebase Setup Instructions */}
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs font-medium text-foreground mb-2">⚠️ Firebase Setup Required:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>1. <strong>Enable Authentication:</strong> Go to Firebase Console → Authentication → Sign-in method → Enable Email/Password</p>
                <p>2. <strong>Set Firestore Rules:</strong> Go to Firestore → Rules, replace with:</p>
                <div className="bg-background p-2 rounded text-xs font-mono mt-1">
                  <div>rules_version = '2';</div>
                  <div>service cloud.firestore {'{'}</div>
                  <div>&nbsp;&nbsp;match /databases/{'{database}'}/documents {'{'}</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;// Users can read/write their own doc</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;match /users/{'{{userId}}'} {'{'}</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;allow read, write: if request.auth.uid == userId;</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;{'}'}</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;// Org-scoped access for demo</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;match /{'{document=**}'} {'{'}</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;allow read, write: if request.auth != null;</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;{'}'}</div>
                  <div>&nbsp;&nbsp;{'}'}</div>
                  <div>{'}'}</div>
                </div>
                <p>3. Click "Publish" to save rules</p>
                <p>4. Click "Setup Demo Data" above to create test users</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
