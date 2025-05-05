import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart3, FileDown, FilePieChart, BarChart4, PieChart } from "lucide-react";
import { getWhistleblowingReports } from "@/services/supabaseService";
import { getPolicies, getComplianceRequirements, getAuditTrail } from "@/services/dataService";
import { Badge } from "@/components/ui/badge";
import { saveAs } from 'file-saver';
import { toast } from "@/components/ui/use-toast";

interface ChartData {
  labels: string[];
  values: number[];
}

interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  lastUpdated: string;
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  lastUpdated: string;
  deadline: string;
}

interface WhistleblowingReport {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  is_anonymous: boolean;
  created_at: string;
  submitted_by: string;
}

interface ExportableData {
  [key: string]: string | number | boolean | null;
}

const Reports = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [complianceReqs, setComplianceReqs] = useState<ComplianceRequirement[]>([]);
  const [whistleblowingReports, setWhistleblowingReports] = useState<WhistleblowingReport[]>([]);
  const [timeRange, setTimeRange] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  
  // Chart data states
  const [policyStatusData, setPolicyStatusData] = useState<ChartData>({ labels: [], values: [] });
  const [policyCategoryData, setPolicyCategoryData] = useState<ChartData>({ labels: [], values: [] });
  const [complianceStatusData, setComplianceStatusData] = useState<ChartData>({ labels: [], values: [] });
  const [complianceCategoryData, setComplianceCategoryData] = useState<ChartData>({ labels: [], values: [] });
  const [whistleblowingStatusData, setWhistleblowingStatusData] = useState<ChartData>({ labels: [], values: [] });
  const [whistleblowingCategoryData, setWhistleblowingCategoryData] = useState<ChartData>({ labels: [], values: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [fetchedPolicies, fetchedComplianceReqs, fetchedWhistleblowingReports] = await Promise.all([
          getPolicies(),
          getComplianceRequirements(),
          getWhistleblowingReports()
        ]);
        
        setPolicies(fetchedPolicies);
        setComplianceReqs(fetchedComplianceReqs);
        setWhistleblowingReports(fetchedWhistleblowingReports);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch reports data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter data based on time range if needed
    let filteredPolicies = policies;
    let filteredComplianceReqs = complianceReqs;
    let filteredWhistleblowingReports = whistleblowingReports;
    
    if (timeRange !== "all") {
      const cutoffDate = new Date();
      
      if (timeRange === "30days") {
        cutoffDate.setDate(cutoffDate.getDate() - 30);
      } else if (timeRange === "90days") {
        cutoffDate.setDate(cutoffDate.getDate() - 90);
      } else if (timeRange === "year") {
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
      }
      
      filteredPolicies = policies.filter(p => new Date(p.lastUpdated) >= cutoffDate);
      filteredComplianceReqs = complianceReqs.filter(c => new Date(c.lastUpdated) >= cutoffDate);
      filteredWhistleblowingReports = whistleblowingReports.filter(r => new Date(r.created_at) >= cutoffDate);
    }
    
    // Process data for charts
    processPolicyData(filteredPolicies);
    processComplianceData(filteredComplianceReqs);
    processWhistleblowingData(filteredWhistleblowingReports);
  }, [policies, complianceReqs, whistleblowingReports, timeRange]);

  const processPolicyData = (data: Policy[]) => {
    // Process policy status data
    const statusCounts: Record<string, number> = {};
    data.forEach(policy => {
      statusCounts[policy.status] = (statusCounts[policy.status] || 0) + 1;
    });
    
    setPolicyStatusData({
      labels: Object.keys(statusCounts),
      values: Object.values(statusCounts),
    });
    
    // Process policy category data
    const categoryCounts: Record<string, number> = {};
    data.forEach(policy => {
      categoryCounts[policy.category] = (categoryCounts[policy.category] || 0) + 1;
    });
    
    setPolicyCategoryData({
      labels: Object.keys(categoryCounts),
      values: Object.values(categoryCounts),
    });
  };

  const processComplianceData = (data: ComplianceRequirement[]) => {
    // Process compliance status data
    const statusCounts: Record<string, number> = {};
    data.forEach(req => {
      statusCounts[req.status] = (statusCounts[req.status] || 0) + 1;
    });
    
    setComplianceStatusData({
      labels: Object.keys(statusCounts),
      values: Object.values(statusCounts),
    });
    
    // Process compliance category data
    const categoryCounts: Record<string, number> = {};
    data.forEach(req => {
      categoryCounts[req.category] = (categoryCounts[req.category] || 0) + 1;
    });
    
    setComplianceCategoryData({
      labels: Object.keys(categoryCounts),
      values: Object.values(categoryCounts),
    });
  };

  const processWhistleblowingData = (data: WhistleblowingReport[]) => {
    // Process whistleblowing status data
    const statusCounts: Record<string, number> = {};
    data.forEach(report => {
      statusCounts[report.status] = (statusCounts[report.status] || 0) + 1;
    });
    
    setWhistleblowingStatusData({
      labels: Object.keys(statusCounts),
      values: Object.values(statusCounts),
    });
    
    // Process whistleblowing category data
    const categoryCounts: Record<string, number> = {};
    data.forEach(report => {
      categoryCounts[report.category] = (categoryCounts[report.category] || 0) + 1;
    });
    
    setWhistleblowingCategoryData({
      labels: Object.keys(categoryCounts),
      values: Object.values(categoryCounts),
    });
  };

  const exportToCSV = (data: ExportableData[], filename: string) => {
    try {
      // Convert data to CSV format
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','), // Header row
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle special characters and commas in values
            return typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          }).join(',')
        )
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Success",
        description: "Report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Error",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = async (data: ExportableData[], filename: string) => {
    try {
      // Create a simple HTML table
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      
      // Add headers
      const headers = Object.keys(data[0]);
      const headerRow = document.createElement('tr');
      headers.forEach(header => {
        const th = document.createElement('th');
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        th.textContent = header;
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);
      
      // Add data rows
      data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
          const td = document.createElement('td');
          td.style.border = '1px solid #ddd';
          td.style.padding = '8px';
          td.textContent = row[header].toString();
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });
      
      // Create a new window and print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${filename}</title>
              <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              <h1>${filename}</h1>
              ${table.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      
      toast({
        title: "Success",
        description: "Report ready for printing",
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Error",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = (type: string, format: 'csv' | 'pdf') => {
    let data: ExportableData[] = [];
    let filename = '';
    
    switch (type) {
      case 'compliance':
        data = complianceReqs;
        filename = 'compliance_report';
        break;
      case 'policies':
        data = policies;
        filename = 'policies_report';
        break;
      case 'whistleblowing':
        data = whistleblowingReports;
        filename = 'whistleblowing_report';
        break;
      default:
        return;
    }
    
    if (format === 'csv') {
      exportToCSV(data, filename);
    } else {
      exportToPDF(data, filename);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="compliance" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="whistleblowing">Whistleblowing</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Compliance Overview</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport("compliance", "csv")}>
                <FileDown className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport("compliance", "pdf")}>
                <FilePieChart className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Compliance Status
                </CardTitle>
                <CardDescription>Distribution of compliance requirements by status</CardDescription>
              </CardHeader>
              <CardContent>
                {complianceStatusData.labels.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complianceStatusData.labels.map((label, index) => (
                      <div key={label} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{label}</span>
                          <span className="text-sm text-muted-foreground">
                            {complianceStatusData.values[index]} ({Math.round(
                              (complianceStatusData.values[index] / complianceStatusData.values.reduce((a, b) => a + b, 0)) * 100
                            )}%)
                          </span>
                        </div>
                        <Progress 
                          value={Math.round(
                            (complianceStatusData.values[index] / complianceStatusData.values.reduce((a, b) => a + b, 0)) * 100
                          )} 
                          className={`h-2 ${
                            label === "Completed" 
                              ? "bg-green-900/30" 
                              : label === "Overdue" 
                              ? "bg-red-900/30" 
                              : "bg-yellow-900/30"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Compliance Categories
                </CardTitle>
                <CardDescription>Distribution of compliance requirements by category</CardDescription>
              </CardHeader>
              <CardContent>
                {complianceCategoryData.labels.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complianceCategoryData.labels.map((label, index) => (
                      <div key={label} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{label}</span>
                          <span className="text-sm text-muted-foreground">
                            {complianceCategoryData.values[index]} ({Math.round(
                              (complianceCategoryData.values[index] / complianceCategoryData.values.reduce((a, b) => a + b, 0)) * 100
                            )}%)
                          </span>
                        </div>
                        <Progress 
                          value={Math.round(
                            (complianceCategoryData.values[index] / complianceCategoryData.values.reduce((a, b) => a + b, 0)) * 100
                          )} 
                          className="h-2 bg-primary/70"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Timeline</CardTitle>
              <CardDescription>Upcoming deadlines and recently completed requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceReqs.length === 0 ? (
                  <div className="flex items-center justify-center h-20 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="rounded-md border border-border">
                    <div className="grid grid-cols-4 p-3 font-medium text-sm text-muted-foreground bg-muted/50">
                      <div>Title</div>
                      <div>Category</div>
                      <div>Deadline</div>
                      <div>Status</div>
                    </div>
                    <div className="divide-y divide-border">
                      {complianceReqs
                        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                        .slice(0, 5)
                        .map((req) => (
                          <div key={req.id} className="grid grid-cols-4 p-3 text-sm">
                            <div className="font-medium">{req.title}</div>
                            <div>{req.category}</div>
                            <div>{new Date(req.deadline).toLocaleDateString()}</div>
                            <div>
                              <Badge
                                variant="outline"
                                className={`${
                                  req.status === "Completed"
                                    ? "badge-success"
                                    : req.status === "Overdue"
                                    ? "badge-danger"
                                    : "badge-warning"
                                }`}
                              >
                                {req.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Policy Analytics</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport("policies", "csv")}>
                <FileDown className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport("policies", "pdf")}>
                <FilePieChart className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Policy Status
                </CardTitle>
                <CardDescription>Distribution of policies by status</CardDescription>
              </CardHeader>
              <CardContent>
                {policyStatusData.labels.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {policyStatusData.labels.map((label, index) => (
                      <div key={label} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{label}</span>
                          <span className="text-sm text-muted-foreground">
                            {policyStatusData.values[index]} ({Math.round(
                              (policyStatusData.values[index] / policyStatusData.values.reduce((a, b) => a + b, 0)) * 100
                            )}%)
                          </span>
                        </div>
                        <Progress 
                          value={Math.round(
                            (policyStatusData.values[index] / policyStatusData.values.reduce((a, b) => a + b, 0)) * 100
                          )} 
                          className={`h-2 ${
                            label === "Active" 
                              ? "bg-green-900/30" 
                              : label === "Draft" 
                              ? "bg-yellow-900/30" 
                              : "bg-gray-900/30"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Policy Categories
                </CardTitle>
                <CardDescription>Distribution of policies by category</CardDescription>
              </CardHeader>
              <CardContent>
                {policyCategoryData.labels.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {policyCategoryData.labels.map((label, index) => (
                      <div key={label} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{label}</span>
                          <span className="text-sm text-muted-foreground">
                            {policyCategoryData.values[index]} ({Math.round(
                              (policyCategoryData.values[index] / policyCategoryData.values.reduce((a, b) => a + b, 0)) * 100
                            )}%)
                          </span>
                        </div>
                        <Progress 
                          value={Math.round(
                            (policyCategoryData.values[index] / policyCategoryData.values.reduce((a, b) => a + b, 0)) * 100
                          )} 
                          className="h-2 bg-primary/70"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recently Updated Policies</CardTitle>
              <CardDescription>Policies that have been recently created or modified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.length === 0 ? (
                  <div className="flex items-center justify-center h-20 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="rounded-md border border-border">
                    <div className="grid grid-cols-4 p-3 font-medium text-sm text-muted-foreground bg-muted/50">
                      <div>Title</div>
                      <div>Category</div>
                      <div>Last Updated</div>
                      <div>Status</div>
                    </div>
                    <div className="divide-y divide-border">
                      {policies
                        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                        .slice(0, 5)
                        .map((policy) => (
                          <div key={policy.id} className="grid grid-cols-4 p-3 text-sm">
                            <div className="font-medium">{policy.title}</div>
                            <div>{policy.category}</div>
                            <div>{new Date(policy.lastUpdated).toLocaleDateString()}</div>
                            <div>
                              <Badge
                                variant="outline"
                                className={`${
                                  policy.status === "Active"
                                    ? "badge-success"
                                    : policy.status === "Draft"
                                    ? "badge-warning"
                                    : "bg-gray-900/30 text-gray-300"
                                }`}
                              >
                                {policy.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whistleblowing" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Whistleblowing Reports Analytics</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport("whistleblowing", "csv")}>
                <FileDown className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport("whistleblowing", "pdf")}>
                <FilePieChart className="mr-2 h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Report Status
                </CardTitle>
                <CardDescription>Distribution of whistleblowing reports by status</CardDescription>
              </CardHeader>
              <CardContent>
                {whistleblowingStatusData.labels.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {whistleblowingStatusData.labels.map((label, index) => (
                      <div key={label} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{label}</span>
                          <span className="text-sm text-muted-foreground">
                            {whistleblowingStatusData.values[index]} ({Math.round(
                              (whistleblowingStatusData.values[index] / whistleblowingStatusData.values.reduce((a, b) => a + b, 0)) * 100
                            )}%)
                          </span>
                        </div>
                        <Progress 
                          value={Math.round(
                            (whistleblowingStatusData.values[index] / whistleblowingStatusData.values.reduce((a, b) => a + b, 0)) * 100
                          )} 
                          className={`h-2 ${
                            label === "Resolved" 
                              ? "bg-green-900/30" 
                              : label === "Investigating" 
                              ? "bg-blue-900/30" 
                              : "bg-yellow-900/30"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Report Categories
                </CardTitle>
                <CardDescription>Distribution of whistleblowing reports by category</CardDescription>
              </CardHeader>
              <CardContent>
                {whistleblowingCategoryData.labels.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {whistleblowingCategoryData.labels.map((label, index) => (
                      <div key={label} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{label}</span>
                          <span className="text-sm text-muted-foreground">
                            {whistleblowingCategoryData.values[index]} ({Math.round(
                              (whistleblowingCategoryData.values[index] / whistleblowingCategoryData.values.reduce((a, b) => a + b, 0)) * 100
                            )}%)
                          </span>
                        </div>
                        <Progress 
                          value={Math.round(
                            (whistleblowingCategoryData.values[index] / whistleblowingCategoryData.values.reduce((a, b) => a + b, 0)) * 100
                          )} 
                          className="h-2 bg-primary/70"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Reports</CardTitle>
              <CardDescription>Recently submitted whistleblowing reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {whistleblowingReports.length === 0 ? (
                  <div className="flex items-center justify-center h-20 text-muted-foreground">
                    No data available
                  </div>
                ) : (
                  <div className="rounded-md border border-border">
                    <div className="grid grid-cols-5 p-3 font-medium text-sm text-muted-foreground bg-muted/50">
                      <div className="col-span-2">Title</div>
                      <div>Category</div>
                      <div>Date Submitted</div>
                      <div>Status</div>
                    </div>
                    <div className="divide-y divide-border">
                      {whistleblowingReports
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 5)
                        .map((report) => (
                          <div key={report.id} className="grid grid-cols-5 p-3 text-sm">
                            <div className="font-medium col-span-2">{report.title}</div>
                            <div>{report.category}</div>
                            <div>{new Date(report.created_at).toLocaleDateString()}</div>
                            <div>
                              <Badge
                                variant="outline"
                                className={`${
                                  report.status === "Resolved"
                                    ? "badge-success"
                                    : report.status === "Investigating"
                                    ? "bg-blue-900/30 text-blue-300"
                                    : "badge-warning"
                                }`}
                              >
                                {report.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
