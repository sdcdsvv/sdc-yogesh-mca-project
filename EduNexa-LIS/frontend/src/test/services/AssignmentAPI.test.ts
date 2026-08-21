import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AssignmentAPI } from '../../services/assignmentAPI';
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
    ASSIGNMENTS: {
      BASE: '/api/assignments',
      BY_ID: (id: string) => `/api/assignments/${id}`,
      SUBMIT: (id: string) => `/api/assignments/${id}/submit`,
      GRADE: (id: string) => `/api/assignments/submissions/${id}/grade`
    }
  }
}));

describe('AssignmentAPI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAssignments', () => {
    it('should fetch assignments successfully', async () => {
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
          submission_count: 5
        }
      ];

      vi.mocked(apiClient.get).mockResolvedValue({
        assignments: mockAssignments
      });

      const result = await AssignmentAPI.getAssignments();

      expect(apiClient.get).toHaveBeenCalledWith('/api/assignments');
      expect(result).toEqual(mockAssignments);
    });

    it('should throw error on invalid response structure', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: [] // Wrong structure
      });

      await expect(AssignmentAPI.getAssignments()).rejects.toThrow(
        'Invalid response format from server'
      );
    });

    it('should throw error on 403 forbidden', async () => {
      const error = new Error('403');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(AssignmentAPI.getAssignments()).rejects.toThrow(
        'You do not have permission to access assignments'
      );
    });

    it('should throw error on 401 unauthorized', async () => {
      const error = new Error('401');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(AssignmentAPI.getAssignments()).rejects.toThrow(
        'Your session has expired'
      );
    });

    it('should handle empty assignments array', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        assignments: []
      });

      const result = await AssignmentAPI.getAssignments();

      expect(result).toEqual([]);
    });
  });

  describe('getAssignmentById', () => {
    it('should fetch assignment by ID successfully', async () => {
      const mockAssignment = {
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
          }
        ]
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        assignment: mockAssignment
      });

      const result = await AssignmentAPI.getAssignmentById('assignment-1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/assignments/assignment-1');
      expect(result).toEqual(mockAssignment);
    });

    it('should throw error on 404 not found', async () => {
      const error = new Error('404');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(AssignmentAPI.getAssignmentById('assignment-1')).rejects.toThrow(
        'Assignment not found'
      );
    });

    it('should throw error on 403 forbidden', async () => {
      const error = new Error('403');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(AssignmentAPI.getAssignmentById('assignment-1')).rejects.toThrow(
        'You do not have permission to access this assignment'
      );
    });

    it('should throw error on invalid response structure', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {} // Wrong structure
      });

      await expect(AssignmentAPI.getAssignmentById('assignment-1')).rejects.toThrow(
        'Invalid response format from server'
      );
    });
  });

  describe('gradeSubmission', () => {
    it('should grade submission successfully', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        message: 'Grade submitted successfully'
      });

      await AssignmentAPI.gradeSubmission('sub-1', {
        grade: 85,
        feedback: 'Good work'
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/assignments/submissions/sub-1/grade',
        {
          grade: 85,
          feedback: 'Good work'
        }
      );
    });

    it('should throw error for missing grade', async () => {
      await expect(
        AssignmentAPI.gradeSubmission('sub-1', {
          grade: undefined as any,
          feedback: 'Good work'
        })
      ).rejects.toThrow('Grade is required');
    });

    it('should throw error for negative grade', async () => {
      await expect(
        AssignmentAPI.gradeSubmission('sub-1', {
          grade: -10,
          feedback: 'Good work'
        })
      ).rejects.toThrow('Grade cannot be negative');
    });

    it('should throw error on 404 not found', async () => {
      const error = new Error('404');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(
        AssignmentAPI.gradeSubmission('sub-1', {
          grade: 85,
          feedback: 'Good work'
        })
      ).rejects.toThrow('Submission not found');
    });

    it('should throw error on 403 forbidden', async () => {
      const error = new Error('403');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(
        AssignmentAPI.gradeSubmission('sub-1', {
          grade: 85,
          feedback: 'Good work'
        })
      ).rejects.toThrow('You do not have permission to grade this submission');
    });

    it('should throw error on 400 bad request', async () => {
      const error = new Error('400');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(
        AssignmentAPI.gradeSubmission('sub-1', {
          grade: 85,
          feedback: 'Good work'
        })
      ).rejects.toThrow('Invalid grade value');
    });

    it('should handle grade without feedback', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        message: 'Grade submitted successfully'
      });

      await AssignmentAPI.gradeSubmission('sub-1', {
        grade: 85
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/assignments/submissions/sub-1/grade',
        {
          grade: 85
        }
      );
    });
  });

  describe('createAssignment', () => {
    it('should create assignment successfully', async () => {
      const mockAssignment = {
        _id: 'assignment-1',
        title: 'New Assignment',
        description: 'Description',
        course_id: 'course-1',
        due_date: '2024-12-31',
        max_points: 100,
        submission_type: 'text' as const,
        allowed_file_types: [],
        max_file_size: 0,
        is_active: true,
        created_by: 'teacher-123',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        assignment: mockAssignment,
        message: 'Assignment created successfully'
      });

      const result = await AssignmentAPI.createAssignment({
        title: 'New Assignment',
        description: 'Description',
        course_id: 'course-1',
        due_date: '2024-12-31'
      });

      expect(apiClient.post).toHaveBeenCalledWith('/api/assignments', {
        title: 'New Assignment',
        description: 'Description',
        course_id: 'course-1',
        due_date: '2024-12-31'
      });
      expect(result).toEqual(mockAssignment);
    });

    it('should throw error on failure', async () => {
      const error = new Error('Network error');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(
        AssignmentAPI.createAssignment({
          title: 'New Assignment',
          description: 'Description',
          course_id: 'course-1',
          due_date: '2024-12-31'
        })
      ).rejects.toThrow('Failed to create assignment');
    });
  });

  describe('updateAssignment', () => {
    it('should update assignment successfully', async () => {
      const mockAssignment = {
        _id: 'assignment-1',
        title: 'Updated Assignment',
        description: 'Updated Description',
        course_id: 'course-1',
        due_date: '2024-12-31',
        max_points: 100,
        submission_type: 'text' as const,
        allowed_file_types: [],
        max_file_size: 0,
        is_active: true,
        created_by: 'teacher-123',
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      };

      vi.mocked(apiClient.put).mockResolvedValue({
        assignment: mockAssignment,
        message: 'Assignment updated successfully'
      });

      const result = await AssignmentAPI.updateAssignment('assignment-1', {
        title: 'Updated Assignment',
        description: 'Updated Description'
      });

      expect(apiClient.put).toHaveBeenCalledWith('/api/assignments/assignment-1', {
        title: 'Updated Assignment',
        description: 'Updated Description'
      });
      expect(result).toEqual(mockAssignment);
    });

    it('should throw error on failure', async () => {
      const error = new Error('Network error');
      vi.mocked(apiClient.put).mockRejectedValue(error);

      await expect(
        AssignmentAPI.updateAssignment('assignment-1', {
          title: 'Updated Assignment'
        })
      ).rejects.toThrow('Failed to update assignment');
    });
  });

  describe('getPendingAssignments', () => {
    it('should filter assignments with submissions', async () => {
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
          submission_count: 5
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
          submission_count: 0
        }
      ];

      vi.mocked(apiClient.get).mockResolvedValue({
        assignments: mockAssignments
      });

      const result = await AssignmentAPI.getPendingAssignments();

      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('assignment-1');
    });
  });
});
