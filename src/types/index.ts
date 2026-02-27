
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
  metadata?: any; // For storing workflow/tool specific data if needed
  is_featured?: boolean;
}

export type AppView = 'search' | 'feed' | 'how-it-works';

export interface SearchState {
  query: string;
  loading: boolean;
  results: ToolRecommendation[] | null;
  sources: GroundingSource[] | null;
  error: string | null;
}

export enum LoadingStage {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE'
}