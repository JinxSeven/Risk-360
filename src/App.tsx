import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "./components/layout/Layout";
import { getUserRole, getCurrentUser } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { isSupabaseConnected } from "@/integrations/supabase/client";

// Pages
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/Policies";
import Compliance from "./pages/Compliance";
import Whistleblowing from "./pages/Whistleblowing";
import ReportIssue from "./pages/ReportIssue";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import WhistleblowingAdmin from "@/pages/admin/Whistleblowing";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin-only route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAdmin = async () => {
      const role = await getUserRole();
      setIsAdmin(role === 'admin');
      setIsLoading(false);
    };
    
    checkAdmin();
  }, []);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Checking permissions...</div>;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [supbaseConnectionStatus, setSupabaseConnectionStatus] = useState<boolean | null>(null);

  // Initialize mock data on app start and check Supabase connection
  useEffect(() => {
    const init = async () => {
      try {
        // Check Supabase connection
        const connected = await isSupabaseConnected();
        setSupabaseConnectionStatus(connected);
        
        // Initialize mock data if needed
        console.log("Mock data initialized successfully");
      } catch (error) {
        console.error("Failed to initialize:", error);
      }
    };
    
    init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {supbaseConnectionStatus === false && (
          <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-background">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Supabase Not Connected</AlertTitle>
              <AlertDescription>
                The application is running with mock data. Connect your Supabase account in the Lovable dashboard for full functionality.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/policies"
            element={
              <ProtectedRoute>
                <Layout>
                  <Policies />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/compliance"
            element={
              <ProtectedRoute>
                <Layout>
                  <Compliance />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/whistleblowing"
            element={
              <ProtectedRoute>
                <Layout>
                  <Whistleblowing />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/report-issue"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReportIssue />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <Users />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/register"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <Register />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/whistleblowing"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <WhistleblowingAdmin />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
