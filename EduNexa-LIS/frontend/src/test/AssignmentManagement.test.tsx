import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AssignmentManagement } from '../pages/AssignmentManagement';
import { AssignmentAPI } from '../services/assignmentAPI';

// Mock the API module
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

describe('AssignmentManagement Component', () => {
  const mockAssignments = [
    {
      _id: 'assignment-1',
      title: 'Assignment 1',
      description: 'Description 1',
      course_id: 'course-1',
      course_title: 'Course 1',
      due_date: '2024-12-31',
      max_points: 100,
      submission_type: 'text' as const,
      allowed_file_types: [],
      max_file_size: 0,
      is_active: true,
      created_by: 'teacher-123',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      submission_count: 5,
      submissions: [
        {
          _id: 'sub-1',
          assignment_id: 'assignment-1',
          student_id: 'student-1',
          student_name: 'Student 1',
          student_email: 'student1@test.com',
          roll_no: 'S001',
          course_id: 'course-1',
          text_content: 'Submission content',
          file_path: '',
          file_name: '',
          submitted_at: '2024-01-15',
          status: 'submitted' as const,
          feedback: ''
        },
        {
          _id: 'sub-2',
          assignment_id: 'assignment-1',
          student_id: 'student-2',
          student_name: 'Student 2',
          student_email: 'student2@test.com',
          roll_no: 'S002',
          course_id: 'course-1',
          text_content: 'Another submission',
          file_path: '',
          file_name: '',
          submitted_at: '2024-01-16',
          status: 'graded' as const,
          grade: 85,
          feedback: 'Good work',
          graded_at: '2024-01-17'
        }
      ]
    },
    {
      _id: 'assignment-2',
      title: 'Assignment 2',
      description: 'Description 2',
      course_id: 'course-2',
      course_title: 'Course 2',
      due_date: '2024-12-25',
      max_points: 50,
      submission_type: 'both' as const,
      allowed_file_types: ['pdf'],
      max_file_size: 5000000,
      is_active: true,
      created_by: 'teacher-123',
      created_at: '2024-01-02',
      updated_at: '2024-01-02',
      submission_count: 0,
      submissions: []
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Assignment List Rendering', () => {
    it('should render assignment list', async () => {
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);

      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Assignment 1')).toBeInTheDocument();
        expect(screen.getByText('Assignment 2')).toBeInTheDocument();
      });
    });

    it('should display submission counts', async () => {
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);

      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('5 submissions')).toBeInTheDocument();
        expect(screen.getByText('0 submissions')).toBeInTheDocument();
      });
    });

    it('should show empty state when no assignments', async () => {
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue([]);

      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('No Assignments')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Functionality', () => {
    beforeEach(() => {
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
    });

    it('should have filter tabs', async () => {
      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Show all assignments/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Show assignments pending review/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Show graded assignments/i })).toBeInTheDocument();
      });
    });

    it('should filter assignments by pending status', async () => {
      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Assignment 1')).toBeInTheDocument();
      });

      const pendingTab = screen.getByRole('tab', { name: /Show assignments pending review/i });
      fireEvent.click(pendingTab);

      // Assignment 1 has pending submissions, should be visible
      expect(screen.getByText('Assignment 1')).toBeInTheDocument();
      // Assignment 2 has no submissions, should not be visible
      expect(screen.queryByText('Assignment 2')).not.toBeInTheDocument();
    });

    it('should filter assignments by graded status', async () => {
      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Assignment 1')).toBeInTheDocument();
      });

      const gradedTab = screen.getByRole('tab', { name: /Show graded assignments/i });
      fireEvent.click(gradedTab);

      // Assignment 1 has graded submissions, should be visible
      expect(screen.getByText('Assignment 1')).toBeInTheDocument();
      // Assignment 2 has no graded submissions, should not be visible
      expect(screen.queryByText('Assignment 2')).not.toBeInTheDocument();
    });
  });

  describe('Assignment Detail View', () => {
    beforeEach(() => {
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
      vi.mocked(AssignmentAPI.getAssignmentById).mockResolvedValue(mockAssignments[0]);
    });

    it('should show assignment details when clicked', async () => {
      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Assignment 1')).toBeInTheDocument();
      });

      const assignmentCard = screen.getByText('Assignment 1');
      fireEvent.click(assignmentCard);

      await waitFor(() => {
        expect(screen.getByText('Assignment Details')).toBeInTheDocument();
      });
    });

    it('should show back button in detail view', async () => {
      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Assignment 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Assignment 1'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Back to List/i })).toBeInTheDocument();
      });
    });

    it('should return to list when back button is clicked', async () => {
      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Assignment 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Assignment 1'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Back to List/i })).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /Back to List/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Assignment Management')).toBeInTheDocument();
      });
    });
  });

  describe('Submission List Rendering', () => {
    beforeEach(() => {
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
      vi.mocked(AssignmentAPI.getAssignmentById).mockResolvedValue(mockAssignments[0]);
    });

    it('should display submissions when assignment is selected', async () => {
      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Assignment 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Assignment 1'));

      await waitFor(() => {
        expect(screen.getByText('Student 1')).toBeInTheDocument();
        expect(screen.getByText('Student 2')).toBeInTheDocument();
      });
    });

    it('should show submission status badges', async () => {
      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Assignment 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Assignment 1'));

      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Graded')).toBeInTheDocument();
      });
    });

    it('should show grade button for pending submissions', async () => {
      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Assignment 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Assignment 1'));

      await waitFor(() => {
        const gradeButtons = screen.getAllByRole('button', { name: /Grade submission/i });
        expect(gradeButtons.length).toBeGreaterThan(0);
      });
    });

    it('should display grade and feedback for graded submissions', async () => {
      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Assignment 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Assignment 1'));

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument();
        expect(screen.getByText('Good work')).toBeInTheDocument();
      });
    });
  });
});
