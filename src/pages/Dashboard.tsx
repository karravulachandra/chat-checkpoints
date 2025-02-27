import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  MessageSquare,
  File,
  Settings,
  Upload,
  LogOut,
} from "lucide-react";
import { api } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/authcontext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, currentUser, userData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<
    Array<{ text: string; sender: "user" | "bot" }>
  >([
    {
      text: `Welcome ${userData?.name || currentUser?.displayName || ""}! Upload a PDF and set up your document analysis query.`,
      sender: "bot",
    },
  ]);

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // States for Document Analysis Query form
  const [queryCompanyName, setQueryCompanyName] = useState("");
  const [queryValidated, setQueryValidated] = useState("YES");
  const [queryOpinion, setQueryOpinion] = useState("Qualified opinion");
  const [queryFinancialYear, setQueryFinancialYear] = useState("");
  const [queryTopListed, setQueryTopListed] = useState("YES");
  const [queryErrors, setQueryErrors] = useState<{
    companyName?: string;
    financialYear?: string;
  }>({});

  // Update welcome message when user data changes
  useEffect(() => {
    setMessages([
      {
        text: `Welcome ${userData?.name || currentUser?.displayName || ""}! Upload a PDF and set up your document analysis query.`,
        sender: "bot",
      },
    ]);
  }, [userData, currentUser]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCurrentFile(file);
      await api.uploadPDF(file);
      setMessages((prev) => [
        ...prev,
        { text: `Uploaded: ${file.name}`, sender: "user" },
        {
          text: "PDF uploaded successfully. You can now configure your document analysis query below.",
          sender: "bot",
        },
      ]);
      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload PDF",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
      setIsLoggingOut(false);
    }
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    const errors: { companyName?: string; financialYear?: string } = {};

    if (!queryCompanyName.trim()) {
      errors.companyName = "Company Name is required";
      hasError = true;
    }
    if (!queryFinancialYear.trim()) {
      errors.financialYear = "Financial Year is required";
      hasError = true;
    }
    setQueryErrors(errors);
    if (hasError) return;

    const formData = {
      companyName: queryCompanyName,
      validated: queryValidated,
      opinion: queryOpinion,
      financialYear: queryFinancialYear,
      topListed: queryTopListed,
    };
    console.log("Submitted query form data:", formData);
    toast({
      title: "Query Submitted",
      description: "Your document analysis settings have been saved.",
    });
    // Optionally, reset form fields here if desired
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">ChatCheckpoints</h2>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Documents</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf"
                      className="hidden"
                    />
                    <SidebarMenuButton
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2" />
                      Upload PDF
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full">
                      <File className="mr-2" />
                      My Documents
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton className="w-full">
                      <MessageSquare className="mr-2" />
                      Chat History
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/settings")}
            >
              <Settings className="mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  index === 0
                    ? "justify-center"
                    : msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <Card
                  className={`max-w-[80%] p-3 ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.text}
                </Card>
              </div>
            ))}
          </div>

          {/* Document Analysis Query Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Card className="mb-4">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Document Analysis Query
                </h3>
                <form onSubmit={handleQuerySubmit} className="space-y-4">
                  {/* 1. Company Name */}
                  <div>
                    <Label htmlFor="queryCompanyName">
                      Name of the company
                    </Label>
                    <Input
                      id="queryCompanyName"
                      type="text"
                      value={queryCompanyName}
                      onChange={(e) => setQueryCompanyName(e.target.value)}
                      placeholder="Enter company name"
                      required
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                    />
                    {queryErrors.companyName && (
                      <p className="text-sm text-destructive mt-1">
                        {queryErrors.companyName}
                      </p>
                    )}
                  </div>

                  {/* 2. Validated dropdown */}
                  <div>
                    <Label htmlFor="queryValidated">Is it validated?</Label>
                    <select
                      id="queryValidated"
                      value={queryValidated}
                      onChange={(e) => setQueryValidated(e.target.value)}
                      className="w-full p-2 border rounded transition-all duration-300 focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="YES">Yes</option>
                      <option value="NO">No</option>
                    </select>
                  </div>

                  {/* 3. Opinion dropdown */}
                  <div>
                    <Label htmlFor="queryOpinion">Opinion</Label>
                    <select
                      id="queryOpinion"
                      value={queryOpinion}
                      onChange={(e) => setQueryOpinion(e.target.value)}
                      className="w-full p-2 border rounded transition-all duration-300 focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="Qualified opinion">Qualified opinion</option>
                      <option value="Adverse opinion">Adverse opinion</option>
                      <option value="Disclaimer of opinion">Disclaimer of opinion</option>
                    </select>
                  </div>

                  {/* 4. Financial Year */}
                  <div>
                    <Label htmlFor="queryFinancialYear">
                      Please enter your Financial year (eg 2020)
                    </Label>
                    <Input
                      id="queryFinancialYear"
                      type="number"
                      value={queryFinancialYear}
                      onChange={(e) => setQueryFinancialYear(e.target.value)}
                      placeholder="Enter financial year"
                      required
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                    />
                    {queryErrors.financialYear && (
                      <p className="text-sm text-destructive mt-1">
                        {queryErrors.financialYear}
                      </p>
                    )}
                  </div>

                  {/* 5. Top Listed dropdown */}
                  <div>
                    <Label htmlFor="queryTopListed">
                      Is the company in the top 1000 listed in March 2023
                      and top 500 in March 2024?
                    </Label>
                    <select
                      id="queryTopListed"
                      value={queryTopListed}
                      onChange={(e) => setQueryTopListed(e.target.value)}
                      className="w-full p-2 border rounded transition-all duration-300 focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full">
                    Submit
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
