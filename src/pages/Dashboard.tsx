import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Clock, AlertTriangle, CheckCircle2, ClipboardList, BookText, AlertCircle, Users } from "lucide-react";
import { getCompany, getPolicies, getComplianceRequirements, getWhistleblowingReports, getUsers } from "@/services/dataService";
import { Company, Policy, ComplianceRequirement, WhistleblowingReport, User } from "@/services/mockData";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [complianceReqs, setComplianceReqs] = useState<ComplianceRequirement[]>([]);
  const [whistleblowingReports, setWhistleblowingReports] = useState<WhistleblowingReport[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState<string>("admin");

  useEffect(() => {
    // Fetch initial data
    setCompany(getCompany());
    setPolicies(getPolicies());
    setComplianceReqs(getComplianceRequirements());
    setWhistleblowingReports(getWhistleblowingReports());
    setUsers(getUsers());
    
    // Get user role
    const storedUserRole = localStorage.getItem("userRole") || "admin";
    setUserRole(storedUserRole);
    
    // Set up polling for data refreshes (in a real app, use websockets)
    const interval = setInterval(() => {
      setPolicies(getPolicies());
      setComplianceReqs(getComplianceRequirements());
      setWhistleblowingReports(getWhistleblowingReports());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate metrics for dashboard
  const activePolicies = policies.filter(p => p.status === "Active").length;
  const draftPolicies = policies.filter(p => p.status === "Draft").length;
  
  const pendingCompliance = complianceReqs.filter(c => c.status === "Pending").length;
  const completedCompliance = complianceReqs.filter(c => c.status === "Completed").length;
  const overdueCompliance = complianceReqs.filter(c => c.status === "Overdue").length;
  const totalCompliance = complianceReqs.length;
  const complianceProgress = totalCompliance ? Math.round((completedCompliance / totalCompliance) * 100) : 0;
  
  const pendingReports = whistleblowingReports.filter(r => r.status === "Pending").length;
  const investigatingReports = whistleblowingReports.filter(r => r.status === "Investigating").length;
  const resolvedReports = whistleblowingReports.filter(r => r.status === "Resolved").length;
  
  // Get upcoming deadlines
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const upcomingDeadlines = complianceReqs
    .filter(req => {
      const deadlineDate = new Date(req.deadline);
      return deadlineDate > today && deadlineDate <= thirtyDaysFromNow && req.status !== "Completed";
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Welcome to RISK 360</h1>
        {company && (
          <p className="text-muted-foreground">
            {company.name} | {company.industry} | {company.location}
          </p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {userRole === "admin" && <TabsTrigger value="compliance">Compliance</TabsTrigger>}
          {userRole === "admin" && <TabsTrigger value="reports">Reports</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="stat-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Policies</CardTitle>
                  <BookText className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-value">{activePolicies}</div>
                <div className="stat-label">Total policies: {policies.length}</div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Status</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-value">{completedCompliance}/{totalCompliance}</div>
                <div className="mt-2">
                  <Progress value={complianceProgress} className="h-2" />
                </div>
                <div className="stat-label">{complianceProgress}% completed</div>
              </CardContent>
            </Card>

            {userRole === "admin" && (
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Whistleblowing Reports</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="stat-value">{whistleblowingReports.length}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="badge-warning">{pendingReports} Pending</Badge>
                    <Badge variant="outline" className="badge-success">{resolvedReports} Resolved</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {userRole === "admin" && (
              <Card className="stat-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="stat-value">{users.length}</div>
                  <div className="stat-label">Active users</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity and Upcoming Deadlines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest changes and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {policies
                  .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                  .slice(0, 3)
                  .map((policy) => (
                    <div key={policy.id} className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <BookText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{policy.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Policy updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                {complianceReqs
                  .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                  .slice(0, 2)
                  .map((req) => (
                    <div key={req.id} className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <ClipboardList className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{req.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Compliance status: {req.status}
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                <CardDescription>Compliance requirements due soon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingDeadlines.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No upcoming deadlines in the next 30 days
                  </div>
                ) : (
                  upcomingDeadlines.slice(0, 5).map((req) => (
                    <div key={req.id} className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        req.priority === "High" 
                          ? "bg-red-900/30" 
                          : req.priority === "Medium" 
                          ? "bg-yellow-900/30" 
                          : "bg-blue-900/30"
                      }`}>
                        <Clock className={`h-4 w-4 ${
                          req.priority === "High" 
                            ? "text-red-300" 
                            : req.priority === "Medium" 
                            ? "text-yellow-300" 
                            : "text-blue-300"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium flex items-center justify-between">
                          <span>{req.title}</span>
                          <Badge variant="outline" className={`
                            ${req.priority === "High" ? "badge-danger" : req.priority === "Medium" ? "badge-warning" : ""}
                          `}>
                            {req.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Due: {new Date(req.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="stat-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-value">{completedCompliance}</div>
                <div className="stat-label">Requirements</div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-value">{pendingCompliance}</div>
                <div className="stat-label">Requirements</div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-value">{overdueCompliance}</div>
                <div className="stat-label">Requirements</div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance by Category</CardTitle>
              <CardDescription>Overview of requirements by type</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Simplified visualization of categories */}
              <div className="space-y-4">
                {Array.from(new Set(complianceReqs.map(req => req.category))).map(category => {
                  const categoryReqs = complianceReqs.filter(req => req.category === category);
                  const completed = categoryReqs.filter(req => req.status === "Completed").length;
                  const total = categoryReqs.length;
                  const percentage = Math.round((completed / total) * 100);
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-muted-foreground">{completed}/{total}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Whistleblowing Reports */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="stat-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-value">{pendingReports}</div>
                <div className="stat-label">New reports</div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Investigating</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-value">{investigatingReports}</div>
                <div className="stat-label">In progress</div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-value">{resolvedReports}</div>
                <div className="stat-label">Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Reports</CardTitle>
              <CardDescription>Latest whistleblowing submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {whistleblowingReports
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((report) => (
                    <div key={report.id} className="flex items-start gap-3 p-3 rounded-md border border-border/50 hover:bg-card/80">
                      <div className={`p-2 rounded-full ${
                        report.status === "Pending" 
                          ? "bg-yellow-900/30" 
                          : report.status === "Investigating" 
                          ? "bg-blue-900/30" 
                          : "bg-green-900/30"
                      }`}>
                        <AlertCircle className={`h-4 w-4 ${
                          report.status === "Pending" 
                            ? "text-yellow-300" 
                            : report.status === "Investigating" 
                            ? "text-blue-300" 
                            : "text-green-300"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{report.title}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {report.category} • {new Date(report.date).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={`
                            ${report.status === "Pending" 
                              ? "badge-warning" 
                              : report.status === "Investigating" 
                              ? "bg-blue-900/30 text-blue-300" 
                              : "badge-success"}
                          `}>
                            {report.status}
                          </Badge>
                          <Badge variant="outline" className={`
                            ${report.priority === "High" 
                              ? "badge-danger" 
                              : report.priority === "Medium" 
                              ? "badge-warning" 
                              : "bg-blue-900/30 text-blue-300"}
                          `}>
                            {report.priority}
                          </Badge>
                          {report.isAnonymous && (
                            <Badge variant="outline" className="bg-gray-900/30 text-gray-300">
                              Anonymous
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
