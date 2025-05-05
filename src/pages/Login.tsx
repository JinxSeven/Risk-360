import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { signIn, initUserSession } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isSupabaseConnected } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if Supabase is connected
    const checkConnection = async () => {
      try {
        const connected = await isSupabaseConnected();
        setIsConnected(connected);
      } catch (error) {
        console.error("Supabase connection check failed:", error);
        setIsConnected(false);
      }
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If Supabase is not connected, use the demo account
      if (!isConnected) {
        toast({
          title: "Logged in with demo account",
          description: "Using mock data since Supabase is not connected",
        });
        localStorage.setItem('userRole', 'admin'); // Set as admin for demo
        navigate("/dashboard");
        setIsLoading(false);
        return;
      }

      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error:", error);
        toast({
          title: "Login failed",
          description: error.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Initialize user session
      const userData = await initUserSession();
      
      if (userData) {
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${userData.name || 'User'}`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: "Could not retrieve user data. Please try again.",
          variant: "destructive",
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error?.message || "A network error occurred. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">RISK 360</h1>
          </div>
        </div>
        
        {!isConnected && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Using demo mode. For full functionality, connect to Supabase in the Lovable dashboard.
              <br />
              <span className="text-sm font-semibold">Just click Login to continue with demo data.</span>
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-xl">Login to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
              {!isConnected && " (or just click Login for demo)"}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={!isConnected ? "demo@example.com" : "you@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isConnected}
                  required={isConnected}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="text-sm text-primary hover:text-primary/90"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!isConnected}
                  required={isConnected}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              
              <div className="text-xs text-center text-muted-foreground mt-4">
                {isConnected ? 
                  "Contact an administrator if you need an account." :
                  "Demo mode is active. Full functionality requires Supabase connection."
                }
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
