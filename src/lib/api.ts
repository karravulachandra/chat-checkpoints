
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = 'http://localhost:8000'; // Update with your FastAPI backend URL

export interface Checkpoint {
  id: string;
  label: string;
  requiresInput: boolean;
  inputPlaceholder?: string;
}

export interface CheckpointWithValue extends Checkpoint {
  value?: string;
  isSelected: boolean;
}

export const api = {
  uploadPDF: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload PDF');
      return await response.json();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },

  processCheckpoints: async (checkpoints: CheckpointWithValue[]) => {
    try {
      const selectedCheckpoints = checkpoints.filter(cp => cp.isSelected);
      const response = await fetch(`${API_BASE_URL}/process-checkpoints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkpoints: selectedCheckpoints }),
      });

      if (!response.ok) throw new Error('Failed to process checkpoints');
      return await response.json();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process checkpoints. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  },
};
