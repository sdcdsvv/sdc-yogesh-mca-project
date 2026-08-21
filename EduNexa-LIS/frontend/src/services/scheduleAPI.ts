import { apiClient, API_ENDPOINTS } from '../config/api';

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  type: 'class' | 'meeting' | 'deadline' | 'exam' | 'office-hours';
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  courseId?: string;
  courseTitle?: string;
  color: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleEventRequest {
  title: string;
  description?: string;
  type?: ScheduleEvent['type'];
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  courseId?: string;
  isShared?: boolean;
}

export class ScheduleAPI {
  static async getEvents(includeShared = false): Promise<ScheduleEvent[]> {
    const endpoint = includeShared
      ? `${API_ENDPOINTS.SCHEDULE.EVENTS}?include_shared=true`
      : API_ENDPOINTS.SCHEDULE.EVENTS;
    const response = await apiClient.get<{ events: ScheduleEvent[] }>(endpoint);
    return response.events;
  }

  static async createEvent(data: CreateScheduleEventRequest): Promise<ScheduleEvent> {
    const payload = {
      ...data,
      start_time: data.startTime,
      end_time: data.endTime,
      course_id: data.courseId,
      is_shared: data.isShared,
    };

    const response = await apiClient.post<{ event: ScheduleEvent }>(
      API_ENDPOINTS.SCHEDULE.EVENTS,
      payload
    );
    return response.event;
  }

  static async deleteEvent(eventId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SCHEDULE.EVENT_BY_ID(eventId));
  }
}

export default ScheduleAPI;

