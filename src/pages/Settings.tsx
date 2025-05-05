import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCompany, updateCompany } from "@/services/dataService";
import { Company } from "@/services/mockData";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentUser, getUserRole } from "@/lib/supabase";
import { getUserProfile, updateUserProfile } from "@/services/supabaseService";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoDeadlineReminders, setAutoDeadlineReminders] = useState(true);
  const [whistleblowingEnabled, setWhistleblowingEnabled] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
          const role = await getUserRole();
          setUserRole(role || 'employee');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    // Get company info
    const companyInfo = getCompany();
    setCompany(companyInfo);
    
    if (companyInfo) {
      setCompanyName(companyInfo.name);
      setIndustry(companyInfo.industry);
      setLocation(companyInfo.location);
      setSize(companyInfo.size);
    }
  }, []);

  const handleSaveProfile = async () => {
    if (!userProfile?.user_id) return;

    try {
      const updates = {
        name: userProfile.name,
        department: userProfile.department
      };

      const updatedProfile = await updateUserProfile(userProfile.user_id, updates);
      
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    const currentPassword = (document.getElementById('current-password') as HTMLInputElement).value;
    const newPassword = (document.getElementById('new-password') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });

      // Clear password fields
      (document.getElementById('current-password') as HTMLInputElement).value = '';
      (document.getElementById('new-password') as HTMLInputElement).value = '';
      (document.getElementById('confirm-password') as HTMLInputElement).value = '';
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveCompanyInfo = () => {
    if (!company) return;
    
    const updatedCompany: Company = {
      ...company,
      name: companyName,
      industry,
      location,
      size,
    };
    
    updateCompany(updatedCompany);
    setCompany(updatedCompany);
    
    toast({
      title: "Company information updated",
      description: "Your changes have been saved successfully.",
    });
  };

  const saveNotificationSettings = () => {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const exportData = () => {
    toast({
      title: "Data export initiated",
      description: "Your data export is being prepared and will be available for download shortly.",
    });
  };

  const deleteAccount = () => {
    // This would need proper confirmation in a real app
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({
        title: "Account deletion requested",
        description: "Your account deletion request has been received.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
          {userRole === "admin" && <TabsTrigger value="company">Company</TabsTrigger>}
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  value={userProfile?.name || ''}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  disabled
                  value={userProfile?.email} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input 
                  id="role" 
                  value={userRole === "admin" ? "Administrator" : "Employee"} 
                  disabled 
                />
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={handleSaveProfile}>Save Profile</Button>
              <Button onClick={handlePasswordChange}>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="font-normal">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications} 
                    />
                  </div>
                  {emailNotifications && (
                    <div className="ml-6 space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="policy-updates" className="font-normal">Policy Updates</Label>
                        <Switch id="policy-updates" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compliance-deadlines" className="font-normal">Compliance Deadlines</Label>
                        <Switch id="compliance-deadlines" defaultChecked />
                      </div>
                      {userRole === "admin" && (
                        <div className="flex items-center justify-between">
                          <Label htmlFor="whistleblowing-reports" className="font-normal">New Whistleblowing Reports</Label>
                          <Switch id="whistleblowing-reports" defaultChecked />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-deadline-reminders" className="font-normal">Automatic Deadline Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminders for upcoming compliance deadlines</p>
                    </div>
                    <Switch 
                      id="auto-deadline-reminders" 
                      checked={autoDeadlineReminders} 
                      onCheckedChange={setAutoDeadlineReminders} 
                    />
                  </div>
                  {autoDeadlineReminders && (
                    <div className="ml-6 space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="reminder-days" className="font-normal">Reminder Days Before Deadline</Label>
                        <Select defaultValue="7">
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Days" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 days</SelectItem>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="14">14 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveNotificationSettings}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Whistleblowing Anonymity</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whistleblowing-enabled" className="font-normal">Enable Whistleblowing</Label>
                    <p className="text-sm text-muted-foreground">Allow anonymous reporting of compliance concerns</p>
                  </div>
                  <Switch 
                    id="whistleblowing-enabled" 
                    checked={whistleblowingEnabled} 
                    onCheckedChange={setWhistleblowingEnabled} 
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Export</h3>
                <p className="text-sm text-muted-foreground">
                  Download a copy of all your data, including policies, compliance records, and reports.
                </p>
                <Button variant="outline" onClick={exportData}>
                  Export All Data
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" onClick={deleteAccount}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {userRole === "admin" && (
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your company details and business information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    placeholder="Acme Corp" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Services">Services</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Company Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger id="size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="50-100">50-100 employees</SelectItem>
                        <SelectItem value="101-500">101-500 employees</SelectItem>
                        <SelectItem value="500+">500+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="Country/Region" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveCompanyInfo}>Save Company Information</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
