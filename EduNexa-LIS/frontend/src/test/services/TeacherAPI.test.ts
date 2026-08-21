import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TeacherAPI from '../../services/teacherAPI';
import { apiClient } from '../../config/api';

// Mock the apiClient
vi.mock('../../config/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  },
  API_ENDPOINTS: {
    ANALYTICS: {
      TEACHER_DASHBOARD: '/api/analytics/teacher/dashboard',
      TEACHER_ASSIGNMENTS: '/api/analytics/teacher/assignments',
      COURSE: (id: string) => `/api/analytics/courses/${id}`,
      STUDENT: (id: string) => `/api/analytics/students/${id}`,
      DASHBOARD: '/api/analytics/dashboard'
    },
    COURSES: {
      BASE: '/api/courses',
      STUDENTS: (id: string) => `/api/courses/${id}/students`
    }
  }
}));

describe('TeacherAPI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should fetch dashboard statistics successfully', async () => {
      const mockStats = {
        active_courses: 5,
        total_students: 100,
        pending_grades: 10,
        course_rating: 4.5,
        monthly_growth: {
          courses: 2,
          students: 15,
          rating_change: 0.3
        }
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        dashboard_stats: mockStats
      });

      const result = await TeacherAPI.getDashboardStats();

      expect(apiClient.get).toHaveBeenCalledWith('/api/analytics/teacher/dashboard');
      expect(result).toEqual(mockStats);
    });

    it('should throw error on 403 forbidden', async () => {
      const error = new Error('403');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(TeacherAPI.getDashboardStats()).rejects.toThrow(
        'You do not have permission to access teacher dashboard'
      );
    });

    it('should throw error on 401 unauthorized', async () => {
      const error = new Error('401');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(TeacherAPI.getDashboardStats()).rejects.toThrow(
        'Your session has expired'
      );
    });

    it('should throw error on 404 not found', async () => {
      const error = new Error('404');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(TeacherAPI.getDashboardStats()).rejects.toThrow(
        'Dashboard statistics endpoint not found'
      );
    });

    it('should throw generic error on other failures', async () => {
      const error = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(TeacherAPI.getDashboardStats()).rejects.toThrow(
        'Failed to load dashboard statistics'
      );
    });
  });

  describe('getCourses', () => {
    it('should fetch teacher courses successfully', async () => {
      const mockCourses = [
        {
          _id: 'course-1',
          title: 'Course 1',
          description: 'Description 1',
          is_active: true,
          enrolled_students: 30,
          total_assignments: 5,
          created_at: '2024-01-01'
        },
        {
          _id: 'course-2',
          title: 'Course 2',
          description: 'Description 2',
          is_active: true,
          enrolled_students: 25,
          total_assignments: 3,
          created_at: '2024-01-02'
        }
      ];

      vi.mocked(apiClient.get).mockResolvedValue({
        courses: mockCourses
      });

      const result = await TeacherAPI.getCourses();

      expect(apiClient.get).toHaveBeenCalledWith('/api/courses');
      expect(result).toEqual(mockCourses);
    });

    it('should throw error on invalid response structure', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [] // Wrong structure
      });

      await expect(TeacherAPI.getCourses()).rejects.toThrow(
        'Invalid response format from server'
      );
    });

    it('should throw error on 403 forbidden', async () => {
      const error = new Error('403');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(TeacherAPI.getCourses()).rejects.toThrow(
        'You do not have permission to access courses'
      );
    });

    it('should throw error on 401 unauthorized', async () => {
      const error = new Error('401');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(TeacherAPI.getCourses()).rejects.toThrow(
        'Your session has expired'
      );
    });

    it('should handle empty courses array', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        courses: []
      });

      const result = await TeacherAPI.getCourses();

      expect(result).toEqual([]);
    });
  });

  describe('getAssignmentStats', () => {
    it('should fetch assignment statistics successfully', async () => {
      const mockStats = {
        total_assignments: 10,
        pending_submissions: 5,
        graded_submissions: 15,
        completion_rate: 75,
        average_grade: 85
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        assignment_stats: mockStats
      });

      const result = await TeacherAPI.getAssignmentStats();

      expect(apiClient.get).toHaveBeenCalledWith('/api/analytics/teacher/assignments');
      expect(result).toEqual(mockStats);
    });

    it('should throw error on 403 forbidden', async () => {
      const error = new Error('403');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(TeacherAPI.getAssignmentStats()).rejects.toThrow(
        'You do not have permission to access assignment statistics'
      );
    });

    it('should throw generic error on failure', async () => {
      const error = new Error('Server error');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(TeacherAPI.getAssignmentStats()).rejects.toThrow(
        'Failed to load assignment statistics'
      );
    });
  });

  describe('getCourseStudents', () => {
    it('should fetch course students successfully', async () => {
      const mockStudents = [
        {
          id: 'student-1',
          name: 'Student 1',
          email: 'student1@test.com',
          roll_no: 'S001'
        },
        {
          id: 'student-2',
          name: 'Student 2',
          email: 'student2@test.com',
          roll_no: 'S002'
        }
      ];

      vi.mocked(apiClient.get).mockResolvedValue({
        students: mockStudents
      });

      const result = await TeacherAPI.getCourseStudents('course-1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/courses/course-1/students');
      expect(result).toEqual(mockStudents);
    });

    it('should throw error on failure', async () => {
      const error = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(TeacherAPI.getCourseStudents('course-1')).rejects.toThrow(
        'Failed to load course students'
      );
    });
  });

  describe('getStudentAnalytics', () => {
    it('should fetch student analytics successfully', async () => {
      const mockAnalytics = {
        student_id: 'student-1',
        overall_grade: 85,
        attendance_rate: 90,
        assignment_completion: 95
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        analytics: mockAnalytics
      });

      const result = await TeacherAPI.getStudentAnalytics('student-1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/analytics/students/student-1');
      expect(result).toEqual(mockAnalytics);
    });

    it('should throw error on failure', async () => {
      const error = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(TeacherAPI.getStudentAnalytics('student-1')).rejects.toThrow(
        'Failed to load student analytics'
      );
    });
  });

  describe('getDashboardData', () => {
    it('should fetch complete dashboard data successfully', async () => {
      const mockStats = {
        active_courses: 5,
        total_students: 100,
        pending_grades: 10,
        course_rating: 4.5,
        monthly_growth: {
          courses: 2,
          students: 15,
          rating_change: 0.3
        }
      };

      const mockCourses = [
        {
          _id: 'course-1',
          title: 'Course 1',
          description: 'Description 1',
          is_active: true,
          enrolled_students: 30,
          total_assignments: 5,
          created_at: '2024-01-01'
        }
      ];

      const mockAssignmentStats = {
        total_assignments: 10,
        pending_submissions: 5,
        graded_submissions: 15,
        completion_rate: 75,
        average_grade: 85
      };

      const mockAnalytics = {
        analytics: {
          recent_activities: [
            { id: '1', type: 'grade', description: 'Graded assignment' }
          ]
        }
      };

      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ dashboard_stats: mockStats })
        .mockResolvedValueOnce({ courses: mockCourses })
        .mockResolvedValueOnce({ assignment_stats: mockAssignmentStats })
        .mockResolvedValueOnce(mockAnalytics);

      const result = await TeacherAPI.getDashboardData();

      expect(result).toEqual({
        stats: mockStats,
        courses: mockCourses,
        recent_activities: mockAnalytics.analytics.recent_activities,
        assignment_stats: mockAssignmentStats
      });
    });

    it('should handle partial failures gracefully', async () => {
      const mockStats = {
        active_courses: 5,
        total_students: 100,
        pending_grades: 10,
        course_rating: 4.5,
        monthly_growth: {
          courses: 2,
          students: 15,
          rating_change: 0.3
        }
      };

      const mockCourses = [
        {
          _id: 'course-1',
          title: 'Course 1',
          description: 'Description 1',
          is_active: true,
          enrolled_students: 30,
          total_assignments: 5,
          created_at: '2024-01-01'
        }
      ];

      const mockAssignmentStats = {
        total_assignments: 10,
        pending_submissions: 5,
        graded_submissions: 15,
        completion_rate: 75,
        average_grade: 85
      };

      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ dashboard_stats: mockStats })
        .mockResolvedValueOnce({ courses: mockCourses })
        .mockResolvedValueOnce({ assignment_stats: mockAssignmentStats })
        .mockRejectedValueOnce(new Error('Failed to fetch activities'));

      const result = await TeacherAPI.getDashboardData();

      expect(result).toEqual({
        stats: mockStats,
        courses: mockCourses,
        recent_activities: [],
        assignment_stats: mockAssignmentStats
      });
    });
  });
});
