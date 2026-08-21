import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TeacherDashboard } from '../components/dashboard/TeacherDashboard';
import TeacherAPI from '../services/teacherAPI';
import { AssignmentAPI } from '../services/assignmentAPI';

// Mock the API modules
vi.mock('../services/teacherAPI');
vi.mock('../services/assignmentAPI');

// Mock the contexts
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      _id: 'teacher-123',
      name: 'Test Teacher',
      email: 'teacher@test.com',
      role: 'teacher'
    },
    isAuthenticated: true,
    isLoading: false
  })
}));

vi.mock('../contexts/LMSContext', () => ({
  useLMS: () => ({
    announcements: [
      { id: '1', title: 'Test Announcement', content: 'Test content', date: '2024-01-01' }
    ],
    sidebarOpen: true,
    setSidebarOpen: vi.fn()
  })
}));

describe('TeacherDashboard Component', () => {
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

  const mockAssignments = [
    {
      _id: 'assignment-1',
      title: 'Assignment 1',
      course_title: 'Course 1',
      due_date: '2024-12-31',
      max_points: 100,
      submission_count: 5,
      description: 'Test assignment',
      course_id: 'course-1',
      submission_type: 'text' as const,
      allowed_file_types: [],
      max_file_size: 0,
      is_active: true,
      created_by: 'teacher-123',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeleton initially', () => {
      // Mock API calls to never resolve
      vi.mocked(TeacherAPI.getDashboardStats).mockImplementation(() => new Promise(() => {}));
      vi.mocked(TeacherAPI.getCourses).mockImplementation(() => new Promise(() => {}));
      vi.mocked(AssignmentAPI.getAssignments).mockImplementation(() => new Promise(() => {}));

      render(<TeacherDashboard />);

      // Check for skeleton loaders (using animate-pulse class)
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should display error message when all API calls fail', async () => {
      // Mock all API calls to fail
      vi.mocked(TeacherAPI.getDashboardStats).mockRejectedValue(new Error('API Error'));
      vi.mocked(TeacherAPI.getCourses).mockRejectedValue(new Error('API Error'));
      vi.mocked(AssignmentAPI.getAssignments).mockRejectedValue(new Error('API Error'));

      render(<TeacherDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to Load Dashboard/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    });

    it('should display retry button in error state', async () => {
      vi.mocked(TeacherAPI.getDashboardStats).mockRejectedValue(new Error('API Error'));
      vi.mocked(TeacherAPI.getCourses).mockRejectedValue(new Error('API Error'));
      vi.mocked(AssignmentAPI.getAssignments).mockRejectedValue(new Error('API Error'));

      render(<TeacherDashboard />);

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /Try Again/i });
        expect(retryButton).toBeInTheDocument();
      });
    });
  });

  describe('Successful Data Rendering', () => {
    beforeEach(() => {
      vi.mocked(TeacherAPI.getDashboardStats).mockResolvedValue(mockStats);
      vi.mocked(TeacherAPI.getCourses).mockResolvedValue(mockCourses);
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
    });

    it('should render welcome section with user name', async () => {
      render(<TeacherDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Test Teacher/i)).toBeInTheDocument();
      });
    });

    it('should render stats cards with correct values', async () => {
      render(<TeacherDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Active Courses')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Total Students')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('Pending Grades')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('Course Rating')).toBeInTheDocument();
        expect(screen.getByText('4.5')).toBeInTheDocument();
      });
    });

    it('should render course cards', async () => {
      render(<TeacherDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Course 1')).toBeInTheDocument();
        expect(screen.getByText('Course 2')).toBeInTheDocument();
      });
    });

    it('should render pending assignments', async () => {
      render(<TeacherDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Assignment 1')).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    beforeEach(() => {
      vi.mocked(TeacherAPI.getDashboardStats).mockResolvedValue(mockStats);
      vi.mocked(TeacherAPI.getCourses).mockResolvedValue(mockCourses);
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
    });

    it('should have a refresh button', async () => {
      render(<TeacherDashboard />);

      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /Refresh dashboard/i });
        expect(refreshButton).toBeInTheDocument();
      });
    });

    it('should call API again when refresh button is clicked', async () => {
      render(<TeacherDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Course 1')).toBeInTheDocument();
      });

      // Clear mock call counts
      vi.clearAllMocks();

      // Mock APIs again for refresh
      vi.mocked(TeacherAPI.getDashboardStats).mockResolvedValue(mockStats);
      vi.mocked(TeacherAPI.getCourses).mockResolvedValue(mockCourses);
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);

      const refreshButton = screen.getByRole('button', { name: /Refresh dashboard/i });
      fireEvent.click(refreshButton);

      // Wait for debounce (1 second)
      await waitFor(() => {
        expect(TeacherAPI.getDashboardStats).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });
});
