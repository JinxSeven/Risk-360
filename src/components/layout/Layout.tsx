
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/supabase";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
      
      // If not logged in and not on login page, redirect to login
      if (!user && !location.pathname.includes("/login")) {
        navigate("/login");
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [location, navigate]);

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If not logged in, render children (should be login page)
  if (!isLoggedIn) {
    return <>{children}</>;
  }

  // Render the app layout when logged in
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
