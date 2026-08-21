import { apiClient, API_ENDPOINTS } from '../config/api';

export interface Discussion {
  id: string;
  title: string;
  content: string;
  course_id?: string;
  course_title?: string;
  tags: string[];
  author_id: string;
  author_name: string;
  author_role?: string;
  created_at: string;
  updated_at: string;
  last_reply_at: string;
  reply_count: number;
  likes: number;
  is_resolved: boolean;
}

export interface CreateDiscussionRequest {
  title: string;
  content: string;
  course_id?: string;
  tags?: string[];
}

export class DiscussionAPI {
  static async getDiscussions(courseId?: string): Promise<Discussion[]> {
    const endpoint = courseId
      ? `${API_ENDPOINTS.DISCUSSIONS.BASE}?course_id=${courseId}`
      : API_ENDPOINTS.DISCUSSIONS.BASE;

    const response = await apiClient.get<{ discussions: Discussion[] }>(endpoint);
    return response.discussions;
  }

  static async createDiscussion(data: CreateDiscussionRequest): Promise<Discussion> {
    const response = await apiClient.post<{ discussion: Discussion }>(
      API_ENDPOINTS.DISCUSSIONS.BASE,
      data
    );
    return response.discussion;
  }
}

export default DiscussionAPI;

