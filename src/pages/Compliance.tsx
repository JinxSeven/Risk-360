
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, Search, Pencil, Trash2, CalendarIcon, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { getComplianceRequirements, createComplianceRequirement, updateComplianceRequirement, deleteComplianceRequirement } from "@/services/dataService";
import { ComplianceRequirement } from "@/services/mockData";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Compliance = () => {
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<ComplianceRequirement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRequirement, setCurrentRequirement] = useState<ComplianceRequirement | null>(null);
  const [userRole, setUserRole] = useState<string>("admin");
  const { toast } = useToast();

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("Legal");
  const [formDeadline, setFormDeadline] = useState<Date | undefined>(new Date());
  const [formStatus, setFormStatus] = useState<'Completed' | 'Pending' | 'Overdue'>("Pending");
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High'>("Medium");
  const [formAssignedTo, setFormAssignedTo] = useState("Legal Team");

  useEffect(() => {
    // Fetch requirements
    const fetchedRequirements = getComplianceRequirements();
    setRequirements(fetchedRequirements);
    setFilteredRequirements(fetchedRequirements);
    
    // Get user role
    const storedUserRole = localStorage.getItem("userRole") || "admin";
    setUserRole(storedUserRole);
  }, []);

  useEffect(() => {
    // Apply filters
    let result = requirements;
    
    if (searchQuery) {
      result = result.filter(
        (req) =>
          req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedStatus !== "all") {
      result = result.filter((req) => req.status === selectedStatus);
    }
    
    if (selectedCategory !== "all") {
      result = result.filter((req) => req.category === selectedCategory);
    }
    
    if (selectedPriority !== "all") {
      result = result.filter((req) => req.priority === selectedPriority);
    }
    
    setFilteredRequirements(result);
  }, [requirements, searchQuery, selectedStatus, selectedCategory, selectedPriority]);

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("Legal");
    setFormDeadline(new Date());
    setFormStatus("Pending");
    setFormPriority("Medium");
    setFormAssignedTo("Legal Team");
    setCurrentRequirement(null);
    setIsEditMode(false);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (requirement: ComplianceRequirement) => {
    setCurrentRequirement(requirement);
    setFormTitle(requirement.title);
    setFormDescription(requirement.description);
    setFormCategory(requirement.category);
    setFormDeadline(new Date(requirement.deadline));
    setFormStatus(requirement.status);
    setFormPriority(requirement.priority);
    setFormAssignedTo(requirement.assignedTo.join(", "));
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formDeadline) {
      toast({
        title: "Missing deadline",
        description: "Please select a deadline for the compliance requirement.",
        variant: "destructive",
      });
      return;
    }

    const assignedToArray = formAssignedTo
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (isEditMode && currentRequirement) {
      // Update existing requirement
      const updatedRequirement = updateComplianceRequirement(currentRequirement.id, {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        deadline: formDeadline.toISOString(),
        status: formStatus,
        priority: formPriority,
        assignedTo: assignedToArray,
      });

      if (updatedRequirement) {
        setRequirements((prevReqs) =>
          prevReqs.map((r) => (r.id === updatedRequirement.id ? updatedRequirement : r))
        );
        
        toast({
          title: "Requirement updated",
          description: "The compliance requirement has been updated successfully.",
        });
      }
    } else {
      // Create new requirement
      const newRequirement = createComplianceRequirement({
        title: formTitle,
        description: formDescription,
        category: formCategory,
        deadline: formDeadline.toISOString(),
        status: formStatus,
        priority: formPriority,
        assignedTo: assignedToArray,
      });

      setRequirements((prevReqs) => [...prevReqs, newRequirement]);
      
      toast({
        title: "Requirement created",
        description: "The new compliance requirement has been created successfully.",
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteRequirement = (reqId: string) => {
    if (confirm("Are you sure you want to delete this compliance requirement?")) {
      const success = deleteComplianceRequirement(reqId);
      
      if (success) {
        setRequirements((prevReqs) => prevReqs.filter((r) => r.id !== reqId));
        
        toast({
          title: "Requirement deleted",
          description: "The compliance requirement has been deleted successfully.",
        });
      }
    }
  };

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(requirements.map((r) => r.category)))];

  // Calculate metrics for progress bar
  const totalRequirements = requirements.length;
  const completedRequirements = requirements.filter(r => r.status === "Completed").length;
  const completionPercentage = totalRequirements ? Math.round((completedRequirements / totalRequirements) * 100) : 0;

  // Get current date
  const currentDate = new Date();

  // Helper function to check if a date is in the past
  const isPastDue = (dateString: string) => {
    const date = new Date(dateString);
    return date < currentDate;
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Compliance Requirements</h1>
        {userRole === "admin" && (
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Requirement
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Overall Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span>{completedRequirements} of {totalRequirements} requirements completed</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search compliance requirements..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Priority" />
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
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderRequirementsList(filteredRequirements)}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {renderRequirementsList(
            filteredRequirements.filter(
              (req) => req.status === "Pending" && !isPastDue(req.deadline)
            )
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {renderRequirementsList(
            filteredRequirements.filter(
              (req) => req.status === "Overdue" || (req.status === "Pending" && isPastDue(req.deadline))
            )
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {renderRequirementsList(
            filteredRequirements.filter((req) => req.status === "Completed")
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Requirement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Requirement" : "Create New Requirement"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the details of the existing compliance requirement."
                : "Add a new compliance requirement to your organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Requirement Title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Health & Safety">Health & Safety</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description of the compliance requirement"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !formDeadline && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formDeadline ? (
                        format(formDeadline, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formDeadline}
                      onSelect={setFormDeadline}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(value) => setFormStatus(value as 'Completed' | 'Pending' | 'Overdue')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formPriority}
                  onValueChange={(value) => setFormPriority(value as 'Low' | 'Medium' | 'High')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  placeholder="e.g., Legal Team, Finance Department"
                  value={formAssignedTo}
                  onChange={(e) => setFormAssignedTo(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{isEditMode ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderRequirementsList(requirementsList: ComplianceRequirement[]) {
    if (requirementsList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No compliance requirements found. Try adjusting your filters or create a new requirement.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {requirementsList
          .sort((a, b) => {
            // Sort by priority first (High > Medium > Low)
            const priorityOrder = { High: 0, Medium: 1, Low: 2 };
            const priorityDiff = 
              priorityOrder[a.priority as keyof typeof priorityOrder] - 
              priorityOrder[b.priority as keyof typeof priorityOrder];
            
            if (priorityDiff !== 0) return priorityDiff;
            
            // Then sort by deadline (soonest first)
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          })
          .map((requirement) => (
            <div
              key={requirement.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${
                  requirement.status === "Completed" 
                    ? "bg-green-900/30" 
                    : requirement.status === "Overdue" 
                    ? "bg-red-900/30" 
                    : isPastDue(requirement.deadline)
                    ? "bg-red-900/30"
                    : "bg-yellow-900/30"
                }`}>
                  {requirement.status === "Completed" 
                    ? <CheckCircle2 className="h-5 w-5 text-green-300" />
                    : requirement.status === "Overdue" 
                    ? <AlertTriangle className="h-5 w-5 text-red-300" />
                    : isPastDue(requirement.deadline)
                    ? <AlertTriangle className="h-5 w-5 text-red-300" />
                    : <Clock className="h-5 w-5 text-yellow-300" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{requirement.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {requirement.category} • Due: {new Date(requirement.deadline).toLocaleDateString()}
                  </div>
                  <div className="text-sm mt-1">{requirement.description}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={`${
                        requirement.status === "Completed"
                          ? "badge-success"
                          : requirement.status === "Overdue" || isPastDue(requirement.deadline)
                          ? "badge-danger"
                          : "badge-warning"
                      }`}
                    >
                      {requirement.status === "Pending" && isPastDue(requirement.deadline)
                        ? "Overdue"
                        : requirement.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`${
                        requirement.priority === "High"
                          ? "badge-danger"
                          : requirement.priority === "Medium"
                          ? "badge-warning"
                          : "bg-blue-900/30 text-blue-300"
                      }`}
                    >
                      {requirement.priority} Priority
                    </Badge>
                    {requirement.assignedTo.map((assignee) => (
                      <Badge key={assignee} variant="outline" className="bg-primary/10 text-primary">
                        {assignee}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              {userRole === "admin" && (
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditDialog(requirement)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteRequirement(requirement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
      </div>
    );
  }
};

export default Compliance;
