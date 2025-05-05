
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookText, Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { getPolicies, createPolicy, updatePolicy, deletePolicy } from "@/services/dataService";
import { Policy } from "@/services/mockData";
import { useToast } from "@/components/ui/use-toast";

const Policies = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null);
  const [userRole, setUserRole] = useState<string>("admin");
  const { toast } = useToast();

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("HR");
  const [formContent, setFormContent] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Draft" | "Archived">("Draft");
  const [formAssignedTo, setFormAssignedTo] = useState("All Employees");

  useEffect(() => {
    // Fetch policies
    const fetchedPolicies = getPolicies();
    setPolicies(fetchedPolicies);
    setFilteredPolicies(fetchedPolicies);
    
    // Get user role
    const storedUserRole = localStorage.getItem("userRole") || "admin";
    setUserRole(storedUserRole);
  }, []);

  useEffect(() => {
    // Apply filters
    let result = policies;
    
    if (searchQuery) {
      result = result.filter(
        (policy) =>
          policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          policy.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedStatus !== "all") {
      result = result.filter((policy) => policy.status === selectedStatus);
    }
    
    if (selectedCategory !== "all") {
      result = result.filter((policy) => policy.category === selectedCategory);
    }
    
    setFilteredPolicies(result);
  }, [policies, searchQuery, selectedStatus, selectedCategory]);

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("HR");
    setFormContent("");
    setFormStatus("Draft");
    setFormAssignedTo("All Employees");
    setCurrentPolicy(null);
    setIsEditMode(false);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (policy: Policy) => {
    setCurrentPolicy(policy);
    setFormTitle(policy.title);
    setFormDescription(policy.description);
    setFormCategory(policy.category);
    setFormContent(policy.content);
    setFormStatus(policy.status);
    setFormAssignedTo(policy.assignedTo.join(", "));
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleViewPolicy = (policy: Policy) => {
    setCurrentPolicy(policy);
    setViewDialogOpen(true);
  };

  const handleSubmit = () => {
    const assignedToArray = formAssignedTo
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (isEditMode && currentPolicy) {
      // Update existing policy
      const updatedPolicy = updatePolicy(currentPolicy.id, {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        content: formContent,
        status: formStatus,
        assignedTo: assignedToArray,
      });

      if (updatedPolicy) {
        setPolicies((prevPolicies) =>
          prevPolicies.map((p) => (p.id === updatedPolicy.id ? updatedPolicy : p))
        );
        
        toast({
          title: "Policy updated",
          description: "The policy has been updated successfully.",
        });
      }
    } else {
      // Create new policy
      const newPolicy = createPolicy({
        title: formTitle,
        description: formDescription,
        category: formCategory,
        content: formContent,
        status: formStatus,
        assignedTo: assignedToArray,
        lastUpdated: new Date().toISOString(),
      });

      setPolicies((prevPolicies) => [...prevPolicies, newPolicy]);
      
      toast({
        title: "Policy created",
        description: "The new policy has been created successfully.",
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeletePolicy = (policyId: string) => {
    if (confirm("Are you sure you want to delete this policy?")) {
      const success = deletePolicy(policyId);
      
      if (success) {
        setPolicies((prevPolicies) => prevPolicies.filter((p) => p.id !== policyId));
        
        toast({
          title: "Policy deleted",
          description: "The policy has been deleted successfully.",
        });
      }
    }
  };

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(policies.map((p) => p.category)))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Policies</h1>
        {userRole === "admin" && (
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Policy
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search policies..."
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
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No policies found. Try adjusting your filters or create a new policy.
              </div>
            ) : (
              filteredPolicies.map((policy) => (
                <Card key={policy.id} className="overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
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
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {policy.category}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2">{policy.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {policy.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewPolicy(policy)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                      {userRole === "admin" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleOpenEditDialog(policy)}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-destructive hover:text-destructive"
                            onClick={() => handleDeletePolicy(policy.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-4">
            {filteredPolicies.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No policies found. Try adjusting your filters or create a new policy.
              </div>
            ) : (
              filteredPolicies.map((policy) => (
                <div
                  key={policy.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <BookText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{policy.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {policy.category} • Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewPolicy(policy)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {userRole === "admin" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditDialog(policy)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeletePolicy(policy.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Policy Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Policy" : "Create New Policy"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the details of the existing policy."
                : "Add a new policy to your organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Policy Title"
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
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Health & Safety">Health & Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the policy"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Full content of the policy"
                className="min-h-32"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(value) => setFormStatus(value as "Active" | "Draft" | "Archived")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  placeholder="e.g., All Employees, IT Department"
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

      {/* View Policy Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{currentPolicy?.title}</DialogTitle>
            <div className="flex gap-2 mt-2">
              <Badge
                variant="outline"
                className={`${
                  currentPolicy?.status === "Active"
                    ? "badge-success"
                    : currentPolicy?.status === "Draft"
                    ? "badge-warning"
                    : "bg-gray-900/30 text-gray-300"
                }`}
              >
                {currentPolicy?.status}
              </Badge>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {currentPolicy?.category}
              </Badge>
            </div>
            <DialogDescription className="mt-2">
              {currentPolicy?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-muted-foreground">
              Last updated: {currentPolicy ? new Date(currentPolicy.lastUpdated).toLocaleDateString() : ""}
            </div>
            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-medium mb-4">Policy Content</h3>
              <div className="whitespace-pre-line text-sm">
                {currentPolicy?.content}
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-medium mb-2">Assigned To</h3>
              <div className="flex flex-wrap gap-2">
                {currentPolicy?.assignedTo.map((assignee) => (
                  <Badge key={assignee} variant="outline">
                    {assignee}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            {userRole === "admin" && currentPolicy && (
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenEditDialog(currentPolicy);
                }}
              >
                Edit Policy
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Policies;
