import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssignmentAPI, Assignment, AssignmentSubmission } from '../assignmentAPI';
import { apiClient } from '../../config/api';

// Mock the API client
vi.mock('../../config/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  API_ENDPOINTS: {
    ASSIGNMENTS: {
      BASE: '/api/assignments',
      BY_ID: (id: string) => `/api/assignments/${id}`,
      SUBMIT: (id: string) => `/api/assignments/${id}/submit`,
      GRADE: (submissionId: string) => `/api/assignments/submissions/${submissionId}/grade`,
    },
  },
}));

const mockApiClient = apiClient as any;

describe('AssignmentAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAssignment: Assignment = {
    _id: 'assignment-1',
    title: 'Test Assignment',
    description: 'Test assignment description',
    course_id: 'course-1',
    course_title: 'Test Course',
    instructions: 'Complete the assignment',
    due_date: '2024-12-31T23:59:59Z',
    max_points: 100,
    submission_type: 'text',
    allowed_file_types: [],
    max_file_size: 10,
    is_active: true,
    created_by: 'teacher-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    submission_count: 5,
  };

  const mockSubmission: AssignmentSubmission = {
    _id: 'submission-1',
    assignment_id: 'assignment-1',
    student_id: 'student-1',
    student_name: 'Test Student',
    student_email: 'student@test.com',
    roll_no: 'ST001',
    course_id: 'course-1',
    text_content: 'Assignment submission content',
    file_path: '',
    file_name: '',
    submitted_at: '2024-01-15T10:00:00Z',
    status: 'submitted',
    feedback: '',
  };

  describe('getAssignments', () => {
    it('should fetch all assignments successfully', async () => {
      const mockResponse = { assignments: [mockAssignment] };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await AssignmentAPI.getAssignments();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/assignments');
      expect(result).toEqual([mockAssignment]);
    });

    it('should handle fetch assignments error', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(AssignmentAPI.getAssignments()).rejects.toThrow('Failed to load assignments');
    });
  });

  describe('getAssignmentById', () => {
    it('should fetch assignment by ID successfully', async () => {
      const mockResponse = { assignment: mockAssignment };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await AssignmentAPI.getAssignmentById('assignment-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/assignments/assignment-1');
      expect(result).toEqual(mockAssignment);
    });
  });

  describe('createAssignment', () => {
    it('should create assignment successfully', async () => {
      const createData = {
        title: 'New Assignment',
        description: 'New assignment description',
        course_id: 'course-1',
        due_date: '2024-12-31T23:59:59Z',
      };
      const mockResponse = { assignment: mockAssignment, message: 'Assignment created' };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await AssignmentAPI.createAssignment(createData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/assignments', createData);
      expect(result).toEqual(mockAssignment);
    });
  });

  describe('gradeSubmission', () => {
    it('should grade submission successfully', async () => {
      const gradeData = { grade: 85, feedback: 'Good work!' };
      mockApiClient.post.mockResolvedValue({ message: 'Graded successfully' });

      await AssignmentAPI.gradeSubmission('submission-1', gradeData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/assignments/submissions/submission-1/grade',
        gradeData
      );
    });
  });

  describe('utility methods', () => {
    it('should check if assignment is overdue', () => {
      const overdueAssignment = { ...mockAssignment, due_date: '2020-01-01T00:00:00Z' };
      const futureAssignment = { ...mockAssignment, due_date: '2030-01-01T00:00:00Z' };

      expect(AssignmentAPI.isAssignmentOverdue(overdueAssignment)).toBe(true);
      expect(AssignmentAPI.isAssignmentOverdue(futureAssignment)).toBe(false);
    });

    it('should format deadline correctly', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowAssignment = { ...mockAssignment, due_date: tomorrow.toISOString() };

      const result = AssignmentAPI.formatDeadline(tomorrowAssignment);
      expect(result).toBe('Due tomorrow');
    });

    it('should determine assignment priority correctly', () => {
      const highPriorityAssignment = { 
        ...mockAssignment, 
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        submission_count: 5,
        submissions: [{ status: 'submitted' }, { status: 'graded' }] as any[]
      };

      const priority = AssignmentAPI.getAssignmentPriority(highPriorityAssignment);
      expect(priority).toBe('high');
    });
  });
});