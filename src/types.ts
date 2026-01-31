
export interface ToolRecommendation {
  id?: string;
  name: string;
  description: string;
  url: string;
  reasoning?: string; // AI logic explanation
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ToolResponse {
  recommendations: ToolRecommendation[];
}

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
