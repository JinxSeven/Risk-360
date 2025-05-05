import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Clock, Search, Filter } from "lucide-react";
import { getWhistleblowingReports, updateWhistleblowingReport } from "@/services/supabaseService";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface WhistleblowingReport {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  is_anonymous: boolean;
  created_at: string;
  submitted_by: string | null;
}

const WhistleblowingAdmin = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<WhistleblowingReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<WhistleblowingReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const allReports = await getWhistleblowingReports();
      setReports(allReports);
      setFilteredReports(allReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast({
          title: "Error",
          description: "Failed to fetch reports. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = reports;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(report => report.priority === priorityFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter, priorityFilter]);

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      // Update the UI optimistically
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      ));

      // Update the database
      await updateWhistleblowingReport(reportId, { status: newStatus });
      toast({
        title: "Success",
        description: "Report status updated successfully.",
      });
    } catch (error) {
      console.error('Error updating report status:', error);
      // Revert the UI change if the database update fails
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: report.status } : report
      ));
      toast({
        title: "Error",
        description: "Failed to update report status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePriorityChange = async (reportId: string, newPriority: string) => {
    try {
      // Update the UI optimistically
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, priority: newPriority } : report
      ));

      // Update the database
      await updateWhistleblowingReport(reportId, { priority: newPriority });
      toast({
        title: "Success",
        description: "Report priority updated successfully.",
      });
    } catch (error) {
      console.error('Error updating report priority:', error);
      // Revert the UI change if the database update fails
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, priority: report.priority } : report
      ));
      toast({
        title: "Error",
        description: "Failed to update report priority. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Whistleblowing Management</h1>
          <p className="text-muted-foreground">Manage and respond to whistleblowing reports</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Investigating">Investigating</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="investigating">Investigating</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports found
            </div>
          ) : (
            filteredReports.map((report) => (
            <Card key={report.id} className="hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <div className="flex gap-2">
                    <Select
                      value={report.status}
                      onValueChange={(value) => handleStatusChange(report.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Investigating">Investigating</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={report.priority}
                      onValueChange={(value) => handlePriorityChange(report.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <CardDescription>
                    {report.category} • {new Date(report.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
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
                    {report.is_anonymous && (
                    <Badge variant="outline" className="bg-gray-900/30 text-gray-300">
                      Anonymous
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports found
            </div>
          ) : (
            filteredReports.filter(report => report.status === "Pending").map((report) => (
              <Card key={report.id} className="hover:bg-card/80 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <div className="flex gap-2">
                      <Select
                        value={report.status}
                        onValueChange={(value) => handleStatusChange(report.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Investigating">Investigating</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={report.priority}
                        onValueChange={(value) => handlePriorityChange(report.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <CardDescription>
                    {report.category} • {new Date(report.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
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
                    {report.is_anonymous && (
                      <Badge variant="outline" className="bg-gray-900/30 text-gray-300">
                        Anonymous
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="investigating" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports found
            </div>
          ) : (
            filteredReports.filter(report => report.status === "Investigating").map((report) => (
              <Card key={report.id} className="hover:bg-card/80 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <div className="flex gap-2">
                      <Select
                        value={report.status}
                        onValueChange={(value) => handleStatusChange(report.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Investigating">Investigating</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={report.priority}
                        onValueChange={(value) => handlePriorityChange(report.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <CardDescription>
                    {report.category} • {new Date(report.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
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
                    {report.is_anonymous && (
                      <Badge variant="outline" className="bg-gray-900/30 text-gray-300">
                        Anonymous
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="resolved" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports found
            </div>
          ) : (
            filteredReports.filter(report => report.status === "Resolved").map((report) => (
              <Card key={report.id} className="hover:bg-card/80 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <div className="flex gap-2">
                      <Select
                        value={report.status}
                        onValueChange={(value) => handleStatusChange(report.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Investigating">Investigating</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={report.priority}
                        onValueChange={(value) => handlePriorityChange(report.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <CardDescription>
                    {report.category} • {new Date(report.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
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
                    {report.is_anonymous && (
                      <Badge variant="outline" className="bg-gray-900/30 text-gray-300">
                        Anonymous
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhistleblowingAdmin; 