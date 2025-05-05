import { useNavigate, useLocation } from "react-router-dom";
import { Shield, LogOut, LayoutDashboard, FileText, AlertCircle, UserCircle, Settings, Bell, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { getUserRole } from "@/lib/supabase";
import { getPolicies, getComplianceRequirements, getWhistleblowingReports } from "@/services/dataService";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick: () => void;
  notificationCount?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isActive,
  onClick,
  notificationCount,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm relative ${
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-grow text-left">{label}</span>
      {notificationCount ? (
        <span className="shrink-0 h-5 min-w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center px-1">
          {notificationCount}
        </span>
      ) : null}
    </button>
  );
};

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationCounts, setNotificationCounts] = useState({
    policies: 0,
    compliance: 0,
    reports: 0,
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRole();
      setUserRole(role);
      setIsLoading(false);
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchNotificationCounts = () => {
      const policies = getPolicies();
      const complianceReqs = getComplianceRequirements();
      const reports = getWhistleblowingReports();

      setNotificationCounts({
        policies: policies.filter(p => p.status === 'Draft').length,
        compliance: complianceReqs.filter(c => c.status === 'Pending').length,
        reports: reports.filter(r => r.status === 'Pending').length,
      });
    };

    fetchNotificationCounts();
    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      href: "/dashboard",
      notificationCount: 0,
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Policies",
      href: "/policies",
      notificationCount: notificationCounts.policies,
    },
    {
      icon: <Info className="h-5 w-5" />,
      label: "Compliance",
      href: "/compliance",
      notificationCount: notificationCounts.compliance,
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: "Reports",
      href: "/reports",
      notificationCount: notificationCounts.reports,
    },
    {
      icon: <AlertCircle className="h-5 w-5" />,
      label: "Report Issue",
      href: "/report-issue",
      notificationCount: 0,
    },
  ];

  // Admin-only items
  const adminItems = [
    {
      icon: <UserCircle className="h-5 w-5" />,
      label: "Users",
      href: "/users",
      notificationCount: 0,
    },
    {
      icon: <AlertCircle className="h-5 w-5" />,
      label: "Whistleblowing",
      href: "/admin/whistleblowing",
      notificationCount: notificationCounts.reports,
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/settings",
      notificationCount: 0,
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    
    if (error) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      
      // Navigate to login page
      navigate("/login");
    }
  };

  return (
    <TooltipProvider>
      <div className="h-screen w-64 bg-sidebar border-r border-border flex flex-col">
        <div className="p-4 flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-lg">RISK 360</h1>
          </div>
        </div>
        
        <Separator className="mb-4" />
        
        <div className="flex-1 px-3 py-2 space-y-1 overflow-auto">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={isActive(item.href)}
              onClick={() => navigate(item.href)}
              notificationCount={item.notificationCount}
            />
          ))}
          
          {/* Only show admin items if user is admin */}
          {userRole === 'admin' && (
            <>
              <Separator className="my-4" />
              <div className="px-3 py-1">
                <p className="text-xs font-medium text-muted-foreground">Administration</p>
              </div>
              
              {adminItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isActive={isActive(item.href)}
                  onClick={() => navigate(item.href)}
                  notificationCount={item.notificationCount}
                />
              ))}
              
              {/* Add link to register new users (admin only) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarItem
                    icon={<UserCircle className="h-5 w-5" />}
                    label="Create User"
                    href="/register"
                    isActive={isActive("/register")}
                    onClick={() => navigate("/register")}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a new user account</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
        
        <div className="p-4 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sm text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
