import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, RefreshCw } from "lucide-react";
import { getWhistleblowingReports } from "@/services/supabaseService";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface WhistleblowingReport {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  is_anonymous: boolean;
  created_at: string;
  submitted_by: string | null;
}

const Whistleblowing = () => {
  const [reports, setReports] = useState<WhistleblowingReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getWhistleblowingReports();
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load whistleblowing reports. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load whistleblowing reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Whistleblowing</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReports} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => navigate("/report-issue")}>Report a Concern</Button>
        </div>
      </div>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Anonymous Reporting</AlertTitle>
        <AlertDescription>
          All whistleblowing reports are confidential and can be submitted anonymously.
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Report a Concern</CardTitle>
            <CardDescription>
              Submit a confidential report about misconduct or violations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use our secure reporting system to report any concerns about illegal activities,
              ethical violations, or other misconduct within the organization.
            </p>
            <Button className="mt-4 w-full" onClick={() => navigate("/report-issue")}>Submit a Report</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Whistleblower Protection</CardTitle>
            <CardDescription>
              Learn about your rights and protections as a whistleblower.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our whistleblower protection policy ensures that you are protected from
              retaliation when reporting concerns in good faith.
            </p>
            <Button variant="outline" className="mt-4 w-full">Read Policy</Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Our Commitment to Ethics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            RISK 360 is committed to maintaining the highest standards of integrity and ethical conduct.
            We encourage a culture where concerns can be raised without fear of reprisal.
            All reports are taken seriously and investigated thoroughly.
          </p>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle>Whistleblowing Reports</CardTitle>
          <CardDescription>View all submitted reports</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-6">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No reports available
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-3 font-medium text-sm text-muted-foreground bg-muted/50">
                <div className="col-span-2">Title</div>
                <div>Category</div>
                <div>Date Submitted</div>
                <div>Status</div>
              </div>
              <div className="divide-y divide-border">
                {reports.map((report) => (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Whistleblowing;
