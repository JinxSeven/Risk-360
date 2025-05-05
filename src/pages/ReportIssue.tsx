import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ShieldAlert, CheckCircle } from "lucide-react";
import { createWhistleblowingReport } from "@/services/supabaseService";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

const ReportIssue = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Ethics");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    if (!title || !description || !category) {
        console.log('Form validation failed:', { title, description, category });
        toast.error('Please fill in all required fields');
        return;
    }

    try {
        setIsSubmitting(true);
        console.log('Submitting report with data:', { title, description, category, priority, isAnonymous });
        
        const result = await createWhistleblowingReport({
            title,
            description,
            category,
            priority,
            isAnonymous,
        });
        
        console.log('Report submitted successfully:', result);
        toast.success('Report submitted successfully');
        
        // Reset form
        setTitle('');
        setDescription('');
        setCategory('Ethics');
        setPriority('Medium');
        setIsAnonymous(true);
        setIsSuccess(true);
    } catch (error) {
        console.error('Error submitting report:', error);
        toast.error('Failed to submit report. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Report an Issue</h1>
        <p className="text-muted-foreground mt-1">
          Submit concerns about policy violations or compliance issues
        </p>
      </div>

      {isSuccess ? (
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-xl">Report Submitted</CardTitle>
            <CardDescription className="text-center max-w-md mx-auto">
              Thank you for your report. All submissions are taken seriously and will be reviewed
              by our compliance team as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-6 pt-2">
            <Button onClick={handleReset}>Submit Another Report</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <CardTitle>Whistleblowing Form</CardTitle>
            </div>
            <CardDescription>
              Your report will be kept confidential and handled according to our whistleblowing policy.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="border border-border/50 rounded-lg p-4 bg-yellow-900/10 flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-500">Important</p>
                  <p className="text-muted-foreground">
                    This system is for reporting policy violations and compliance concerns. For emergencies or
                    situations requiring immediate attention, please contact appropriate authorities directly.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Report Title</Label>
                <Input
                  id="title"
                  placeholder="Brief title describing the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what happened, when, where, and who was involved (if known)"
                  className="min-h-32"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ethics">Ethics Violation</SelectItem>
                      <SelectItem value="Financial">Financial Misconduct</SelectItem>
                      <SelectItem value="Health & Safety">Health & Safety</SelectItem>
                      <SelectItem value="Harassment">Harassment or Discrimination</SelectItem>
                      <SelectItem value="Data Protection">Data Protection</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={priority} 
                    onValueChange={(value) => setPriority(value as "Low" | "Medium" | "High")}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch 
                  id="anonymous" 
                  checked={isAnonymous} 
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous" className="text-sm font-normal">
                  Submit this report anonymously
                </Label>
              </div>

              <div className="text-sm text-muted-foreground">
                By submitting this report, you confirm that the information provided is accurate to the best of your
                knowledge and that you are not deliberately making false claims.
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ReportIssue;
