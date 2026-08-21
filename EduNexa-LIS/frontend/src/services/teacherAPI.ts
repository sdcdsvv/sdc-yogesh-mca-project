// Teacher API Service Module
import { apiClient, API_ENDPOINTS } from '../config/api';
import {
  TeacherStats,
  TeacherAnalytics,
  AssignmentStats,
  TeacherCourse,
  TeacherStudent,
  StudentAnalytics,
  TeacherDashboardData
} from '../types/teacher';

export class TeacherAPI {
  /**
   * Get teacher dashboard statistics
   */
  static async getDashboardStats(): Promise<TeacherStats> {
    try {
      const response = await apiClient.get<{ dashboard_stats: TeacherStats }>(
        API_ENDPOINTS.ANALYTICS.TEACHER_DASHBOARD
      );
      return response.dashboard_stats;
    } catch (error: any) {
      console.error('Failed to fetch teacher dashboard stats:', error);
      
      // Provide user-friendly error messages based on error type
      if (error.message?.includes('403')) {
        throw new Error('You do not have permission to access teacher dashboard. Please ensure you are logged in as a teacher.');
      } else if (error.message?.includes('401')) {
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.message?.includes('404')) {
        throw new Error('Dashboard statistics endpoint not found. Please contact support.');
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      } else {
        throw new Error('Failed to load dashboard statistics. Please try again later.');
      }
    }
  }

  /**
   * Get teacher assignment statistics
   */
  static async getAssignmentStats(): Promise<AssignmentStats> {
    try {
      const response = await apiClient.get<{ assignment_stats: AssignmentStats }>(
        API_ENDPOINTS.ANALYTICS.TEACHER_ASSIGNMENTS
      );
      return response.assignment_stats;
    } catch (error: any) {
      console.error('Failed to fetch teacher assignment stats:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('403')) {
        throw new Error('You do not have permission to access assignment statistics.');
      } else if (error.message?.includes('401')) {
        throw new Error('Your session has expired. Please log in again.');
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      } else {
        throw new Error('Failed to load assignment statistics. Please try again later.');
      }
    }
  }

  /**
   * Get teacher's courses with enhanced statistics
   * For teachers, the backend automatically filters to return only their courses
   * and includes enrollment counts and assignment statistics
   */
  static async getCourses(): Promise<TeacherCourse[]> {
    try {
      const response = await apiClient.get<{ courses: TeacherCourse[] }>(
        API_ENDPOINTS.COURSES.BASE
      );
      
      // Verify response structure
      if (!response.courses || !Array.isArray(response.courses)) {
        console.error('Invalid response structure from courses endpoint:', response);
        throw new Error('Invalid response format from server');
      }
      
      return response.courses;
    } catch (error: any) {
      console.error('Failed to fetch teacher courses:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('403')) {
        throw new Error('You do not have permission to access courses.');
      } else if (error.message?.includes('401')) {
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.message?.includes('Invalid response format')) {
        throw error; // Re-throw the specific error
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      } else {
        throw new Error('Failed to load courses. Please try again later.');
      }
    }
  }

  /**
   * Get students for a specific course
   */
  static async getCourseStudents(courseId: string): Promise<TeacherStudent[]> {
    try {
      const response = await apiClient.get<{ students: TeacherStudent[] }>(
        API_ENDPOINTS.COURSES.STUDENTS(courseId)
      );
      return response.students;
    } catch (error) {
      console.error('Failed to fetch course students:', error);
      throw new Error('Failed to load course students');
    }
  }

  /**
   * Get analytics for a specific student
   */
  static async getStudentAnalytics(studentId: string): Promise<StudentAnalytics> {
    try {
      const response = await apiClient.get<{ analytics: StudentAnalytics }>(
        API_ENDPOINTS.ANALYTICS.STUDENT(studentId)
      );
      return response.analytics;
    } catch (error) {
      console.error('Failed to fetch student analytics:', error);
      throw new Error('Failed to load student analytics');
    }
  }

  /**
   * Get analytics for a specific course
   */
  static async getCourseAnalytics(courseId: string): Promise<any> {
    try {
      const response = await apiClient.get<{ analytics: any }>(
        API_ENDPOINTS.ANALYTICS.COURSE(courseId)
      );
      return response.analytics;
    } catch (error) {
      console.error('Failed to fetch course analytics:', error);
      throw new Error('Failed to load course analytics');
    }
  }

  /**
   * Get comprehensive teacher dashboard data
   * Combines multiple API calls for complete dashboard view
   */
  static async getDashboardData(): Promise<TeacherDashboardData> {
    try {
      const [stats, courses, assignmentStats] = await Promise.all([
        this.getDashboardStats(),
        this.getCourses(),
        this.getAssignmentStats()
      ]);

      // Get recent activities from general analytics
      let recent_activities: any[] = [];
      try {
        const analyticsResponse = await apiClient.get<{ analytics: any }>(
          API_ENDPOINTS.ANALYTICS.DASHBOARD
        );
        recent_activities = analyticsResponse.analytics.recent_activities || [];
      } catch (error) {
        console.warn('Failed to fetch recent activities:', error);
        recent_activities = [];
      }

      return {
        stats,
        courses,
        recent_activities,
        assignment_stats: assignmentStats
      };
    } catch (error) {
      console.error('Failed to fetch teacher dashboard data:', error);
      throw new Error('Failed to load dashboard data');
    }
  }

  /**
   * Get all students across teacher's courses
   */
  static async getAllStudents(): Promise<TeacherStudent[]> {
    try {
      // First try to get test users from the test-users endpoint
      try {
        const testUsersResponse = await apiClient.get<{ students: any[] }>(
          '/test-users/students?limit=1000'
        );
        
        if (testUsersResponse.students && testUsersResponse.students.length > 0) {
          // Map test users to TeacherStudent format
          return testUsersResponse.students.map(student => ({
            id: student._id,
            name: student.name,
            email: student.email,
            roll_no: student.roll_number || 'N/A',
            department: student.department || 'N/A',
            progress: Math.floor(Math.random() * 100), // Random progress for demo
            enrolled_at: student.created_at || new Date().toISOString(),
            is_active: student.is_active !== false
          }));
        }
      } catch (testError) {
        console.warn('Test users endpoint not available, falling back to course students:', testError);
      }

      // Fallback: Get students from enrolled courses
      const courses = await this.getCourses();
      const allStudents: TeacherStudent[] = [];
      const studentIds = new Set<string>();

      // Get students from all courses and deduplicate
      for (const course of courses) {
        try {
          // Use _id or id, whichever is available
          const courseId = course._id || (course as any).id;
          if (!courseId) {
            console.warn('Course missing ID:', course);
            continue;
          }
          
          const courseStudents = await this.getCourseStudents(courseId);
          courseStudents.forEach(student => {
            if (!studentIds.has(student.id)) {
              studentIds.add(student.id);
              allStudents.push(student);
            }
          });
        } catch (error) {
          console.warn(`Failed to fetch students for course ${course.title}:`, error);
        }
      }

      return allStudents;
    } catch (error) {
      console.error('Failed to fetch all students:', error);
      throw new Error('Failed to load students');
    }
  }

  /**
   * Get teacher analytics overview
   */
  static async getAnalytics(): Promise<TeacherAnalytics> {
    try {
      const dashboard_stats = await this.getDashboardStats();
      return { dashboard_stats };
    } catch (error) {
      console.error('Failed to fetch teacher analytics:', error);
      throw new Error('Failed to load analytics');
    }
  }
}

export default TeacherAPI;