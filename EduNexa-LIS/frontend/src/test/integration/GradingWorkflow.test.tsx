import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssignmentManagement } from '../../pages/AssignmentManagement';
import { AssignmentAPI } from '../../services/assignmentAPI';

// Mock the API module
vi.mock('../../services/assignmentAPI');

// Mock the contexts
vi.mock('../../contexts/AuthContext', () => ({
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

describe('Grading Workflow Integration Tests', () => {
  const mockAssignments = [
    {
      _id: 'assignment-1',
      title: 'Math Assignment',
      description: 'Solve problems 1-10',
      course_id: 'course-1',
      course_title: 'Mathematics 101',
      due_date: '2024-12-31',
      max_points: 100,
      submission_type: 'text' as const,
      allowed_file_types: [],
      max_file_size: 0,
      is_active: true,
      created_by: 'teacher-123',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      submission_count: 2,
      submissions: [
        {
          _id: 'sub-1',
          assignment_id: 'assignment-1',
          student_id: 'student-1',
          student_name: 'Alice Johnson',
          student_email: 'alice@test.com',
          roll_no: 'S001',
          course_id: 'course-1',
          text_content: 'Here are my solutions to problems 1-10',
          file_path: '',
          file_name: '',
          submitted_at: '2024-01-15T10:00:00Z',
          status: 'submitted' as const,
          feedback: ''
        },
        {
          _id: 'sub-2',
          assignment_id: 'assignment-1',
          student_id: 'student-2',
          student_name: 'Bob Smith',
          student_email: 'bob@test.com',
          roll_no: 'S002',
          course_id: 'course-1',
          text_content: 'My completed assignment',
          file_path: '',
          file_name: '',
          submitted_at: '2024-01-16T10:00:00Z',
          status: 'submitted' as const,
          feedback: ''
        }
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Grading Flow', () => {
    it('should complete full flow from assignment list to grade submission', async () => {
      const user = userEvent.setup();
      
      // Mock initial assignment list
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
      
      // Mock assignment details
      vi.mocked(AssignmentAPI.getAssignmentById).mockResolvedValue(mockAssignments[0]);
      
      // Mock grade submission
      vi.mocked(AssignmentAPI.gradeSubmission).mockResolvedValue();

      // Render the component
      render(<AssignmentManagement />);

      // Step 1: Wait for assignments to load
      await waitFor(() => {
        expect(screen.getByText('Math Assignment')).toBeInTheDocument();
      });

      // Step 2: Click on assignment to view details
      const assignmentCard = screen.getByText('Math Assignment');
      fireEvent.click(assignmentCard);

      // Step 3: Wait for submissions to load
      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      });

      // Step 4: Click grade button for first submission
      const gradeButtons = screen.getAllByRole('button', { name: /Grade submission/i });
      fireEvent.click(gradeButtons[0]);

      // Step 5: Wait for grading modal to open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText(/Grade \(out of 100\)/i)).toBeInTheDocument();
      });

      // Step 6: Enter grade
      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '92');

      // Step 7: Enter feedback
      const feedbackInput = screen.getByLabelText(/Feedback/i);
      await user.type(feedbackInput, 'Excellent work! All problems solved correctly.');

      // Step 8: Submit grade
      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      // Step 9: Verify API was called with correct data
      await waitFor(() => {
        expect(AssignmentAPI.gradeSubmission).toHaveBeenCalledWith('sub-1', {
          grade: 92,
          feedback: 'Excellent work! All problems solved correctly.'
        });
      });

      // Step 10: Verify success message appears
      await waitFor(() => {
        expect(screen.getByText(/Grade submitted successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle grading multiple submissions in sequence', async () => {
      const user = userEvent.setup();
      
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
      vi.mocked(AssignmentAPI.getAssignmentById).mockResolvedValue(mockAssignments[0]);
      vi.mocked(AssignmentAPI.gradeSubmission).mockResolvedValue();

      render(<AssignmentManagement />);

      // Wait for assignments to load
      await waitFor(() => {
        expect(screen.getByText('Math Assignment')).toBeInTheDocument();
      });

      // Click on assignment
      fireEvent.click(screen.getByText('Math Assignment'));

      // Wait for submissions
      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      // Grade first submission
      const gradeButtons = screen.getAllByRole('button', { name: /Grade submission/i });
      fireEvent.click(gradeButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText(/Grade \(out of 100\)/i)).toBeInTheDocument();
      });

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '92');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(AssignmentAPI.gradeSubmission).toHaveBeenCalledWith('sub-1', {
          grade: 92,
          feedback: ''
        });
      });

      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }, { timeout: 2000 });

      // Grade second submission
      const updatedGradeButtons = screen.getAllByRole('button', { name: /Grade submission/i });
      fireEvent.click(updatedGradeButtons[1]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText(/Grade \(out of 100\)/i)).toBeInTheDocument();
      });

      const gradeInput2 = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput2);
      await user.type(gradeInput2, '88');

      const submitButton2 = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton2);

      await waitFor(() => {
        expect(AssignmentAPI.gradeSubmission).toHaveBeenCalledWith('sub-2', {
          grade: 88,
          feedback: ''
        });
      });
    });
  });

  describe('Optimistic UI Updates', () => {
    it('should update UI immediately before API confirmation', async () => {
      const user = userEvent.setup();
      
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
      vi.mocked(AssignmentAPI.getAssignmentById).mockResolvedValue(mockAssignments[0]);
      
      // Mock slow API response
      vi.mocked(AssignmentAPI.gradeSubmission).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Math Assignment')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Math Assignment'));

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      const gradeButtons = screen.getAllByRole('button', { name: /Grade submission/i });
      fireEvent.click(gradeButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText(/Grade \(out of 100\)/i)).toBeInTheDocument();
      });

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '95');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      // Verify optimistic update happens immediately
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    it('should revert UI on API failure', async () => {
      const user = userEvent.setup();
      
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
      vi.mocked(AssignmentAPI.getAssignmentById).mockResolvedValue(mockAssignments[0]);
      
      // Mock API failure
      vi.mocked(AssignmentAPI.gradeSubmission).mockRejectedValue(
        new Error('Failed to submit grade')
      );

      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Math Assignment')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Math Assignment'));

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      const gradeButtons = screen.getAllByRole('button', { name: /Grade submission/i });
      fireEvent.click(gradeButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText(/Grade \(out of 100\)/i)).toBeInTheDocument();
      });

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '95');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      // Verify error message appears
      await waitFor(() => {
        expect(screen.getByText(/Failed to submit grade/i)).toBeInTheDocument();
      });

      // Modal should remain open on error
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
      vi.mocked(AssignmentAPI.getAssignmentById).mockResolvedValue(mockAssignments[0]);
      vi.mocked(AssignmentAPI.gradeSubmission).mockRejectedValue(
        new Error('Network error')
      );

      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Math Assignment')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Math Assignment'));

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      const gradeButtons = screen.getAllByRole('button', { name: /Grade submission/i });
      fireEvent.click(gradeButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText(/Grade \(out of 100\)/i)).toBeInTheDocument();
      });

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '85');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      const user = userEvent.setup();
      
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
      vi.mocked(AssignmentAPI.getAssignmentById).mockResolvedValue(mockAssignments[0]);
      
      // First call fails, second succeeds
      vi.mocked(AssignmentAPI.gradeSubmission)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce();

      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Math Assignment')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Math Assignment'));

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      const gradeButtons = screen.getAllByRole('button', { name: /Grade submission/i });
      fireEvent.click(gradeButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText(/Grade \(out of 100\)/i)).toBeInTheDocument();
      });

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '85');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      
      // First attempt - fails
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });

      // Second attempt - succeeds
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Grade submitted successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle validation errors before submission', async () => {
      const user = userEvent.setup();
      
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
      vi.mocked(AssignmentAPI.getAssignmentById).mockResolvedValue(mockAssignments[0]);

      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Math Assignment')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Math Assignment'));

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      const gradeButtons = screen.getAllByRole('button', { name: /Grade submission/i });
      fireEvent.click(gradeButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByLabelText(/Grade \(out of 100\)/i)).toBeInTheDocument();
      });

      // Try to submit without entering grade
      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      expect(submitButton).toBeDisabled();

      // Enter invalid grade (exceeds max)
      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '150');

      fireEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/Grade cannot exceed/i)).toBeInTheDocument();
      });

      // API should not be called
      expect(AssignmentAPI.gradeSubmission).not.toHaveBeenCalled();
    });
  });

  describe('Navigation and State Management', () => {
    it('should maintain state when navigating back and forth', async () => {
      vi.mocked(AssignmentAPI.getAssignments).mockResolvedValue(mockAssignments);
      vi.mocked(AssignmentAPI.getAssignmentById).mockResolvedValue(mockAssignments[0]);

      render(<AssignmentManagement />);

      await waitFor(() => {
        expect(screen.getByText('Math Assignment')).toBeInTheDocument();
      });

      // Navigate to assignment details
      fireEvent.click(screen.getByText('Math Assignment'));

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      // Navigate back to list
      const backButton = screen.getByRole('button', { name: /Back to List/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('Assignment Management')).toBeInTheDocument();
      });

      // Assignment should still be in the list
      expect(screen.getByText('Math Assignment')).toBeInTheDocument();
    });
  });
});
