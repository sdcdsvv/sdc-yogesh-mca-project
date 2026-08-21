/** Place and vision-related types */

export interface PlaceInfo {
  name: string;
  description: string;
  history: string;
  best_time_to_visit: string;
  nearby_places: string[];
  dos_and_donts: string[];
  crowd_level: 'Low' | 'Medium' | 'High' | 'Unknown';
}

export interface VisionAnalysisResponse {
  success: boolean;
  identified: boolean;
  data: PlaceInfo;
  raw_response?: string;
  message?: string;
}

