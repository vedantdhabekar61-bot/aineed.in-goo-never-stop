
export interface ToolRecommendation {
  id?: string;
  name: string;
  description: string;
  url: string;
  reasoning?: string;
}

export interface WorkflowPlan {
  toolName: string;
  steps: {
    action: string;
    description: string;
  }[];
  uploadGuide: string;
  promptTemplate: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ToolResponse {
  recommendations: ToolRecommendation[];
}

export interface FeedPost {
  id: string;
  title: string;
  content: string;
  type: 'workflow' | 'automation' | 'announcement';
  created_at: string;
  likes_count?: number;
  is_liked?: boolean;
  metadata?: any;
}

export type AppView = 'search' | 'feed' | 'how-it-works';
