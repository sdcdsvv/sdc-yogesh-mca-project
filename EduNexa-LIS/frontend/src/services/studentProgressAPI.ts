// Student Progress API Service Module
import { apiClient } from '../config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.160.108.56:5010/api';

// Student Progress interfaces
export interface StudentProgress {
  student_id: string;
  student_name: string;
  student_email: string;
  roll_no: string;
  department: string;
  course_id: string;
  course_title: string;
  enrolled_at: string;
  progress: number;
  completed_materials: number;
  total_materials: number;
  assignments_submitted: number;
  total_assignments: number;
  average_grade: number;
  engagement_score: number;
  last_activity: string;
  is_active: boolean;
  needs_attention: boolean;
}

export interface VideoProgress {
  video_id: string;
  video_title: string;
  watch_time: number;
  total_duration: number;
  progress_percentage: number;
  last_watched: string | null;
  completed: boolean;
}

export interface AssignmentProgress {
  assignment_id: string;
  assignment_title: string;
  due_date: string;
  max_points: number;
  submitted: boolean;
  submitted_at: string | null;
  grade: number | null;
  feedback: string | null;
  status: string;
  is_late: boolean;
}

export interface CourseProgress {
  course_id: string;
  course_title: string;
  enrolled_at: string;
  overall_progress: number;
  materials: {
    total: number;
    completed: number;
    completion_rate: number;
  };
  videos: {
    total: number;
    progress: VideoProgress[];
    total_watch_time_minutes: number;
  };
  assignments: {
    total: number;
    submitted: number;
    graded: number;
    average_grade: number;
    progress: AssignmentProgress[];
  };
  performance_metrics: {
    engagement_rate: number;
    completion_rate: number;
    average_grade: number;
    time_spent_minutes: number;
  };
}

export interface DetailedStudentProgress {
  student_id: string;
  student_name: string;
  student_email: string;
  roll_no: string;
  department: string;
  courses_enrolled: number;
  average_progress: number;
  overall_average_grade: number;
  course_progress: CourseProgress[];
}

export interface CourseStudentProgress {
  student_id: string;
  student_name: string;
  student_email: string;
  roll_no: string;
  enrolled_at: string;
  overall_progress: number;
  material_completion: number;
  assignment_completion: number;
  assignments_submitted: number;
  assignments_graded: number;
  average_grade: number;
  recent_activity_count: number;
  last_activity: string;
  is_active: boolean;
}

export interface CourseProgressStats {
  total_students: number;
  average_progress: number;
  average_grade: number;
  active_students: number;
  struggling_students: number;
  excelling_students: number;
}

export interface CourseProgressResponse {
  course_id: string;
  course_title: string;
  statistics: CourseProgressStats;
  students: CourseStudentProgress[];
}

export class StudentProgressAPI {
  /**
   * Get progress tracking for all students across teacher's courses
   */
  static async getAllStudentsProgress(): Promise<StudentProgress[]> {
    try {
      const response = await apiClient.get<{ students: StudentProgress[] }>(
        `${API_BASE_URL}/student-progress/teacher/students`
      );
      return response.students;
    } catch (error) {
      console.error('Failed to fetch students progress:', error);
      throw new Error('Failed to load students progress');
    }
  }

  /**
   * Get detailed progress tracking for a specific student
   */
  static async getStudentDetailedProgress(studentId: string): Promise<DetailedStudentProgress> {
    try {
      const response = await apiClient.get<{ student_progress: DetailedStudentProgress }>(
        `${API_BASE_URL}/student-progress/teacher/student/${studentId}`
      );
      return response.student_progress;
    } catch (error) {
      console.error('Failed to fetch student detailed progress:', error);
      throw new Error('Failed to load student detailed progress');
    }
  }

  /**
   * Get progress tracking for all students in a specific course
   */
  static async getCourseStudentsProgress(courseId: string): Promise<CourseProgressResponse> {
    try:
      const response = await apiClient.get<CourseProgressResponse>(
        `${API_BASE_URL}/student-progress/teacher/course/${courseId}/progress`
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch course students progress:', error);
      throw new Error('Failed to load course students progress');
    }
  }

  /**
   * Get students who need attention (low engagement or progress)
   */
  static async getStudentsNeedingAttention(): Promise<StudentProgress[]> {
    try {
      const allStudents = await this.getAllStudentsProgress();
      return allStudents.filter(student => student.needs_attention);
    } catch (error) {
      console.error('Failed to fetch students needing attention:', error);
      throw new Error('Failed to load students needing attention');
    }
  }

  /**
   * Get top performing students across all courses
   */
  static async getTopPerformingStudents(limit: number = 10): Promise<StudentProgress[]> {
    try {
      const allStudents = await this.getAllStudentsProgress();
      return allStudents
        .sort((a, b) => b.engagement_score - a.engagement_score)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch top performing students:', error);
      throw new Error('Failed to load top performing students');
    }
  }

  /**
   * Get engagement statistics for a specific course
   */
  static async getCourseEngagementStats(courseId: string): Promise<{
    total_students: number;
    active_students: number;
    engagement_rate: number;
    average_progress: number;
    students_at_risk: number;
  }> {
    try {
      const courseProgress = await this.getCourseStudentsProgress(courseId);
      const stats = courseProgress.statistics;
      
      return {
        total_students: stats.total_students,
        active_students: stats.active_students,
        engagement_rate: stats.total_students > 0 
          ? (stats.active_students / stats.total_students) * 100 
          : 0,
        average_progress: stats.average_progress,
        students_at_risk: stats.struggling_students
      };
    } catch (error) {
      console.error('Failed to fetch course engagement stats:', error);
      throw new Error('Failed to load course engagement statistics');
    }
  }

  /**
   * Get student progress summary for dashboard
   */
  static async getProgressSummary(): Promise<{
    total_students: number;
    active_students: number;
    students_needing_attention: number;
    average_engagement: number;
    average_progress: number;
  }> {
    try {
      const allStudents = await this.getAllStudentsProgress();
      
      const activeStudents = allStudents.filter(s => s.is_active).length;
      const studentsNeedingAttention = allStudents.filter(s => s.needs_attention).length;
      const totalEngagement = allStudents.reduce((sum, s) => sum + s.engagement_score, 0);
      const totalProgress = allStudents.reduce((sum, s) => sum + s.progress, 0);
      
      return {
        total_students: allStudents.length,
        active_students: activeStudents,
        students_needing_attention: studentsNeedingAttention,
        average_engagement: allStudents.length > 0 ? totalEngagement / allStudents.length : 0,
        average_progress: allStudents.length > 0 ? totalProgress / allStudents.length : 0
      };
    } catch (error) {
      console.error('Failed to fetch progress summary:', error);
      throw new Error('Failed to load progress summary');
    }
  }

  /**
   * Get students by progress range
   */
  static async getStudentsByProgressRange(
    minProgress: number,
    maxProgress: number
  ): Promise<StudentProgress[]> {
    try {
      const allStudents = await this.getAllStudentsProgress();
      return allStudents.filter(
        student => student.progress >= minProgress && student.progress <= maxProgress
      );
    } catch (error) {
      console.error('Failed to fetch students by progress range:', error);
      throw new Error('Failed to load students by progress range');
    }
  }

  /**
   * Get students with low engagement (engagement score < 40)
   */
  static async getLowEngagementStudents(): Promise<StudentProgress[]> {
    try {
      const allStudents = await this.getAllStudentsProgress();
      return allStudents.filter(student => student.engagement_score < 40);
    } catch (error) {
      console.error('Failed to fetch low engagement students:', error);
      throw new Error('Failed to load low engagement students');
    }
  }

  /**
   * Get students with no recent activity (last 7 days)
   */
  static async getInactiveStudents(): Promise<StudentProgress[]> {
    try {
      const allStudents = await this.getAllStudentsProgress();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      return allStudents.filter(student => {
        const lastActivity = new Date(student.last_activity);
        return lastActivity < sevenDaysAgo;
      });
    } catch (error) {
      console.error('Failed to fetch inactive students:', error);
      throw new Error('Failed to load inactive students');
    }
  }
}

export default StudentProgressAPI;


// Engagement Monitoring interfaces
export interface EngagementAlert {
  student_id: string;
  student_name: string;
  student_email: string;
  roll_no: string;
  course_id: string;
  course_title: string;
  alert_severity: 'high' | 'medium' | 'low';
  alert_reasons: string[];
  progress: number;
  last_activity: string;
  assignments_completed: number;
  total_assignments: number;
  created_at: string;
}

export interface EngagementSummary {
  total_students: number;
  active_students: number;
  at_risk_students: number;
  inactive_students: number;
  average_engagement: number;
  engagement_rate: number;
  at_risk_rate: number;
  engagement_trend: 'improving' | 'stable' | 'declining';
  last_updated: string;
}

export interface CourseEngagementData {
  course_id: string;
  course_title: string;
  total_students: number;
  engagement_breakdown: {
    highly_engaged: number;
    moderately_engaged: number;
    low_engagement: number;
    inactive: number;
  };
  recent_activity: Array<{
    student_name: string;
    activity_type: string;
    assignment_title: string;
    timestamp: string;
    grade: number | null;
  }>;
  engagement_by_time: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
  };
}

export class EngagementMonitoringAPI {
  /**
   * Get real-time engagement alerts for students needing attention
   */
  static async getEngagementAlerts(): Promise<{ alerts: EngagementAlert[]; total_alerts: number }> {
    try {
      const response = await apiClient.get<{ alerts: EngagementAlert[]; total_alerts: number }>(
        `${API_BASE_URL}/student-progress/teacher/engagement/alerts`
      );
      return response;
    } catch (error) {
      console.error('Failed to fetch engagement alerts:', error);
      throw new Error('Failed to load engagement alerts');
    }
  }

  /**
   * Get real-time engagement summary across all courses
   */
  static async getEngagementSummary(): Promise<EngagementSummary> {
    try {
      const response = await apiClient.get<{ summary: EngagementSummary }>(
        `${API_BASE_URL}/student-progress/teacher/engagement/summary`
      );
      return response.summary;
    } catch (error) {
      console.error('Failed to fetch engagement summary:', error);
      throw new Error('Failed to load engagement summary');
    }
  }

  /**
   * Monitor real-time engagement for a specific course
   */
  static async monitorCourseEngagement(courseId: string): Promise<CourseEngagementData> {
    try {
      const response = await apiClient.get<{ engagement_data: CourseEngagementData }>(
        `${API_BASE_URL}/student-progress/teacher/engagement/course/${courseId}/monitor`
      );
      return response.engagement_data;
    } catch (error) {
      console.error('Failed to fetch course engagement data:', error);
      throw new Error('Failed to load course engagement data');
    }
  }

  /**
   * Get high priority alerts (high severity only)
   */
  static async getHighPriorityAlerts(): Promise<EngagementAlert[]> {
    try {
      const { alerts } = await this.getEngagementAlerts();
      return alerts.filter(alert => alert.alert_severity === 'high');
    } catch (error) {
      console.error('Failed to fetch high priority alerts:', error);
      throw new Error('Failed to load high priority alerts');
    }
  }

  /**
   * Get alerts for a specific course
   */
  static async getCourseAlerts(courseId: string): Promise<EngagementAlert[]> {
    try {
      const { alerts } = await this.getEngagementAlerts();
      return alerts.filter(alert => alert.course_id === courseId);
    } catch (error) {
      console.error('Failed to fetch course alerts:', error);
      throw new Error('Failed to load course alerts');
    }
  }

  /**
   * Check if there are any critical alerts
   */
  static async hasCriticalAlerts(): Promise<boolean> {
    try {
      const highPriorityAlerts = await this.getHighPriorityAlerts();
      return highPriorityAlerts.length > 0;
    } catch (error) {
      console.error('Failed to check critical alerts:', error);
      return false;
    }
  }
}

export default EngagementMonitoringAPI;
