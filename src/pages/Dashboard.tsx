import { useState, useRef, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  MessageSquare,
  File,
  Settings,
  Upload,
  Send,
  LogOut,
} from "lucide-react";
import { api, type CheckpointWithValue } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/authcontext";

const CHECKPOINTS: CheckpointWithValue[] = [
  {
    id: "summary",
    label: "Generate Summary",
    requiresInput: false,
    isSelected: false,
  },
  {
    id: "extract_dates",
    label: "Extract Important Dates",
    requiresInput: false,
    isSelected: false,
  },
  {
    id: "custom_question",
    label: "Ask Custom Question",
    requiresInput: true,
    inputPlaceholder: "Enter your question about the document",
    isSelected: false,
  },
  {
    id: "extract_entities",
    label: "Extract Named Entities",
    requiresInput: false,
    isSelected: false,
  },
  {
    id: "search",
    label: "Search for Specific Term",
    requiresInput: true,
    inputPlaceholder: "Enter search term",
    isSelected: false,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, currentUser, userData } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Array<{ text: string; sender: "user" | "bot" }>>([
    { text: `Welcome ${userData?.name || currentUser?.displayName || ''}! Upload a PDF and select checkpoints to analyze it.`, sender: "bot" },
  ]);
  const [checkpoints, setCheckpoints] = useState<CheckpointWithValue[]>(CHECKPOINTS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Update welcome message when user data changes
  useEffect(() => {
    setMessages([
      { text: `Welcome ${userData?.name || currentUser?.displayName || ''}! Upload a PDF and select checkpoints to analyze it.`, sender: "bot" },
    ]);
  }, [userData, currentUser]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCurrentFile(file);
      const result = await api.uploadPDF(file);
      setMessages(prev => [...prev, 
        { text: `Uploaded: ${file.name}`, sender: "user" },
        { text: "PDF uploaded successfully. You can now select checkpoints to analyze it.", sender: "bot" }
      ]);
      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload PDF",
        variant: "destructive"
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
        variant: "destructive"
      });
      setIsLoggingOut(false);
    }
  };

  const handleCheckpointToggle = (checkpointId: string) => {
    setCheckpoints(checkpoints.map(cp => 
      cp.id === checkpointId ? { ...cp, isSelected: !cp.isSelected } : cp
    ));
  };

  const handleInputChange = (checkpointId: string, value: string) => {
    setCheckpoints(checkpoints.map(cp => 
      cp.id === checkpointId ? { ...cp, value } : cp
    ));
  };

  const handleProcessCheckpoints = async () => {
    const selectedCheckpoints = checkpoints.filter(cp => cp.isSelected);
    if (selectedCheckpoints.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one checkpoint",
        variant: "destructive"
      });
      return;
    }

    const missingInputs = selectedCheckpoints.some(
      cp => cp.requiresInput && !cp.value
    );
    if (missingInputs) {
      toast({
        title: "Error",
        description: "Please fill in all required inputs",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.processCheckpoints(selectedCheckpoints);
      setMessages(prev => [...prev, 
        { text: "Processing checkpoints...", sender: "user" },
        { text: response.result, sender: "bot" }
      ]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process checkpoints",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
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

          <div className="border-t p-4">
            <Card className="mb-4">
              <ScrollArea className="h-[200px] p-4">
                <div className="space-y-4">
                  {checkpoints.map((checkpoint) => (
                    <div key={checkpoint.id} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={checkpoint.id}
                          checked={checkpoint.isSelected}
                          onCheckedChange={() => handleCheckpointToggle(checkpoint.id)}
                        />
                        <Label htmlFor={checkpoint.id}>{checkpoint.label}</Label>
                      </div>
                      {checkpoint.requiresInput && checkpoint.isSelected && (
                        <Input
                          value={checkpoint.value || ""}
                          onChange={(e) => handleInputChange(checkpoint.id, e.target.value)}
                          placeholder={checkpoint.inputPlaceholder}
                          className="ml-6"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
            <Button 
              onClick={handleProcessCheckpoints} 
              className="w-full"
              disabled={isProcessing || !currentFile}
            >
              <Send className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Process Checkpoints"}
            </Button>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;