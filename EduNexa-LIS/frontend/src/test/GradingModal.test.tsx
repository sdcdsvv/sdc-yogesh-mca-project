import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GradingModal } from '../components/assignments/GradingModal';
import { AssignmentAPI } from '../services/assignmentAPI';

// Mock the API module
vi.mock('../services/assignmentAPI');

describe('GradingModal Component', () => {
  const mockSubmission = {
    _id: 'sub-1',
    student_id: 'student-1',
    student_name: 'John Doe',
    student_email: 'john@test.com',
    roll_no: 'S001',
    text_content: 'This is my submission content',
    file_name: 'assignment.pdf',
    file_path: '/uploads/assignment.pdf',
    submitted_at: '2024-01-15T10:00:00Z',
    status: 'submitted'
  };

  const mockGradedSubmission = {
    ...mockSubmission,
    _id: 'sub-2',
    status: 'graded',
    grade: 85,
    feedback: 'Good work!',
    graded_at: '2024-01-16T10:00:00Z'
  };

  const mockOnClose = vi.fn();
  const mockOnGradeSubmitted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Modal Open/Close', () => {
    it('should not render when isOpen is false', () => {
      render(
        <GradingModal
          isOpen={false}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      expect(screen.queryByText('Grade Submission')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      expect(screen.getByText('Grade Submission')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const closeButton = screen.getByRole('button', { name: /Close grading modal/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking outside modal', () => {
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const overlay = screen.getByRole('dialog');
      fireEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close modal when Escape key is pressed', () => {
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Grade Validation', () => {
    it('should show error for negative grade', async () => {
      const user = userEvent.setup();
      
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '-10');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Grade cannot be negative/i)).toBeInTheDocument();
      });
    });

    it('should show error for grade exceeding max points', async () => {
      const user = userEvent.setup();
      
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '150');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Grade cannot exceed/i)).toBeInTheDocument();
      });
    });

    it('should accept valid grade within range', async () => {
      const user = userEvent.setup();
      vi.mocked(AssignmentAPI.gradeSubmission).mockResolvedValue();
      
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '85');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(AssignmentAPI.gradeSubmission).toHaveBeenCalledWith('sub-1', {
          grade: 85,
          feedback: ''
        });
      });
    });

    it('should display percentage calculation', async () => {
      const user = userEvent.setup();
      
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '85');

      await waitFor(() => {
        expect(screen.getByText('85.0%')).toBeInTheDocument();
      });
    });
  });

  describe('Feedback Validation', () => {
    it('should accept feedback text', async () => {
      const user = userEvent.setup();
      vi.mocked(AssignmentAPI.gradeSubmission).mockResolvedValue();
      
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      const feedbackInput = screen.getByLabelText(/Feedback/i);

      await user.clear(gradeInput);
      await user.type(gradeInput, '85');
      await user.type(feedbackInput, 'Great work on this assignment!');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(AssignmentAPI.gradeSubmission).toHaveBeenCalledWith('sub-1', {
          grade: 85,
          feedback: 'Great work on this assignment!'
        });
      });
    });

    it('should display character count for feedback', async () => {
      const user = userEvent.setup();
      
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const feedbackInput = screen.getByLabelText(/Feedback/i);
      await user.type(feedbackInput, 'Good work');

      await waitFor(() => {
        expect(screen.getByText('9 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Submission Success', () => {
    it('should call onGradeSubmitted with optimistic update', async () => {
      const user = userEvent.setup();
      vi.mocked(AssignmentAPI.gradeSubmission).mockResolvedValue();
      
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      const feedbackInput = screen.getByLabelText(/Feedback/i);

      await user.clear(gradeInput);
      await user.type(gradeInput, '90');
      await user.type(feedbackInput, 'Excellent work!');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnGradeSubmitted).toHaveBeenCalledWith('sub-1', 90, 'Excellent work!');
      });
    });

    it('should show success message on successful submission', async () => {
      const user = userEvent.setup();
      vi.mocked(AssignmentAPI.gradeSubmission).mockResolvedValue();
      
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '85');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Grade submitted successfully/i)).toBeInTheDocument();
      });
    });

    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();
      vi.mocked(AssignmentAPI.gradeSubmission).mockImplementation(() => new Promise(() => {}));
      
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '85');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Submission Failure', () => {
    it('should show error message on failed submission', async () => {
      const user = userEvent.setup();
      vi.mocked(AssignmentAPI.gradeSubmission).mockRejectedValue(new Error('Network error'));
      
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '85');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('should call onGradeSubmitted without params to trigger refresh on error', async () => {
      const user = userEvent.setup();
      vi.mocked(AssignmentAPI.gradeSubmission).mockRejectedValue(new Error('API Error'));
      
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i);
      await user.clear(gradeInput);
      await user.type(gradeInput, '85');

      const submitButton = screen.getByRole('button', { name: /Submit Grade/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // First call is optimistic update, second call is revert
        expect(mockOnGradeSubmitted).toHaveBeenCalledTimes(2);
        expect(mockOnGradeSubmitted).toHaveBeenLastCalledWith();
      });
    });
  });

  describe('Graded Submission Display', () => {
    it('should display current grade for already graded submission', () => {
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockGradedSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      expect(screen.getByText('Current Grade')).toBeInTheDocument();
      expect(screen.getByText(/85\/100/i)).toBeInTheDocument();
      expect(screen.getByText('Good work!')).toBeInTheDocument();
    });

    it('should show Update Grade button for graded submission', () => {
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockGradedSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      expect(screen.getByRole('button', { name: /Update Grade/i })).toBeInTheDocument();
    });

    it('should pre-fill form with existing grade and feedback', () => {
      render(
        <GradingModal
          isOpen={true}
          onClose={mockOnClose}
          submission={mockGradedSubmission}
          maxPoints={100}
          onGradeSubmitted={mockOnGradeSubmitted}
        />
      );

      const gradeInput = screen.getByLabelText(/Grade \(out of 100\)/i) as HTMLInputElement;
      const feedbackInput = screen.getByLabelText(/Feedback/i) as HTMLTextAreaElement;

      expect(gradeInput.value).toBe('85');
      expect(feedbackInput.value).toBe('Good work!');
    });
  });
});
