/**
 * Activity Tracking API Service
 * Handles all activity-related API calls
 */

import api from './apiClient';

export interface ActivityDetails {
  description: string;
  [key: string]: any;
}

export interface Activity {
  _id: string;
  user_id: string;
  service_type: 'itinerary' | 'vision' | 'chat' | 'emergency' | 'weather' | 'places' | 'translation';
  action: string;
  details: ActivityDetails;
  request_data: Record<string, any>;
  response_data: Record<string, any>;
  metadata: Record<string, any>;
  timestamp: string;
  duration_ms: number;
  status: 'success' | 'failed' | 'partial';
}

export interface ActivityHistoryResponse {
  success: boolean;
  data: {
    activities: Activity[];
    count: number;
    limit: number;
    skip: number;
    filters?: {
      service_type?: string;
      days?: string;
    };
  };
}

export interface UsageSummary {
  total_activities: number;
  period_days: number;
  services: Array<{
    _id: string;
    count: number;
    last_used: string;
    avg_duration: number;
  }>;
  most_used_service: string | null;
}

export interface TimelineItem {
  _id: string;
  count: number;
  services: string[];
}

export interface ServiceAnalytics {
  total_uses: number;
  unique_actions: string[];
  avg_duration: number;
  first_used: string | null;
  last_used: string | null;
}

class ActivityService {
  /**
   * Get activity history with filters
   */
  async getHistory(params?: {
    limit?: number;
    skip?: number;
    service_type?: string;
    days?: number;
  }): Promise<ActivityHistoryResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.service_type) queryParams.append('service_type', params.service_type);
    if (params?.days) queryParams.append('days', params.days.toString());
    
    const url = `/activity/history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  }

  /**
   * Get recent activities
   */
  async getRecent(limit: number = 10): Promise<{
    success: boolean;
    data: {
      activities: Activity[];
      count: number;
    };
  }> {
    const response = await api.get(`/activity/recent?limit=${limit}`);
    return response.data;
  }

  /**
   * Get usage summary
   */
  async getSummary(days: number = 30): Promise<{
    success: boolean;
    data: UsageSummary;
  }> {
    const response = await api.get(`/activity/summary?days=${days}`);
    return response.data;
  }

  /**
   * Get activity timeline
   */
  async getTimeline(params?: {
    group_by?: 'day' | 'week' | 'month';
    days?: number;
  }): Promise<{
    success: boolean;
    data: {
      timeline: TimelineItem[];
      group_by: string;
      days: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('group_by', params?.group_by || 'day');
    queryParams.append('days', (params?.days || 30).toString());
    
    const response = await api.get(`/activity/timeline?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get service-specific analytics
   */
  async getServiceAnalytics(serviceType: string): Promise<{
    success: boolean;
    data: {
      service_type: string;
      analytics: ServiceAnalytics;
    };
  }> {
    const response = await api.get(`/activity/analytics/${serviceType}`);
    return response.data;
  }

  /**
   * Delete all activity history
   */
  async deleteHistory(): Promise<{
    success: boolean;
    message: string;
    data: { deleted_count: number };
  }> {
    const response = await api.delete('/activity/history');
    return response.data;
  }

  /**
   * Log activity manually (usually done by backend)
   */
  async logActivity(activityData: {
    service_type: string;
    action: string;
    details?: Record<string, any>;
    request_data?: Record<string, any>;
    response_data?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<{
    success: boolean;
    message: string;
    data: Activity;
  }> {
    const response = await api.post('/activity/log', activityData);
    return response.data;
  }
}

export const activityService = new ActivityService();
export default activityService;
