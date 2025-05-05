
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export function Header() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userRole, setUserRole] = useState<string>("admin");
  const [userName, setUserName] = useState<string>("Admin User");

  useEffect(() => {
    // In a real app, you would fetch notifications from an API
    const storedNotifications = JSON.parse(
      localStorage.getItem("notifications") || "[]"
    );
    setNotifications(storedNotifications);
    
    // Get user role and name
    const storedUserRole = localStorage.getItem("userRole") || "admin";
    setUserRole(storedUserRole);
    setUserName(storedUserRole === "admin" ? "Admin User" : "Employee User");
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((n) => ({
      ...n,
      read: true,
    }));
    setNotifications(updatedNotifications);
    localStorage.setItem(
      "notifications",
      JSON.stringify(updatedNotifications)
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">
        {window.location.pathname === "/dashboard"
          ? "Dashboard"
          : window.location.pathname.substring(1).charAt(0).toUpperCase() +
            window.location.pathname.substring(1).slice(1)}
      </h2>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-4 ${
                    !notification.read ? "bg-muted/30" : ""
                  }`}
                >
                  <div className="font-medium mb-1">{notification.title}</div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {notification.message}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {notification.date}
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">{userName}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {userRole}
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
