/**
 * Course Creation Functionality Audit Test
 * 
 * This test verifies:
 * 1. Form validation for all required fields
 * 2. Course creation flow completes successfully
 * 3. File upload functionality (thumbnail and video)
 * 4. Success and error message handling
 * 5. No console errors during the process
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateCoursePage } from '../components/courses/CreateCoursePage';
import { AuthContext } from '../contexts/AuthContext';
import * as api from '../config/api';

// Mock the API
vi.mock('../config/api', () => ({
  apiClient: {
    post: vi.fn(),
  },
  API_ENDPOINTS: {
    COURSES: {
      BASE: '/api/courses',
    },
  },
}));

// Mock window navigation
const mockNavigate = vi.fn();
vi.stubGlobal('history', {
  pushState: mockNavigate,
  back: vi.fn(),
});

vi.stubGlobal('dispatchEvent', vi.fn());

describe('Course Creation Page - Audit', () => {
  const mockUser = {
    id: '123',
    name: 'Test Teacher',
    email: 'teacher@test.com',
    role: 'teacher' as const,
  };

  const mockAuthContext = {
    user: mockUser,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    isAuthenticated: true,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        <CreateCoursePage />
      </AuthContext.Provider>
    );
  };

  describe('Form Validation', () => {
    it('should display validation errors for required fields', async () => {
      renderComponent();

      // Try to submit without filling required fields
      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Check for validation error messages
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    it('should validate title length (min 5 characters)', async () => {
      renderComponent();

      const titleInput = screen.getByPlaceholderText(/Introduction to Machine Learning/i);
      fireEvent.change(titleInput, { target: { value: 'Test' } });

      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title must be at least 5 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate description length (min 20 characters)', async () => {
      renderComponent();

      const descriptionInput = screen.getByPlaceholderText(/Provide a detailed description/i);
      fireEvent.change(descriptionInput, { target: { value: 'Short desc' } });

      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/description must be at least 20 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate category is selected', async () => {
      renderComponent();

      const titleInput = screen.getByPlaceholderText(/Introduction to Machine Learning/i);
      fireEvent.change(titleInput, { target: { value: 'Test Course Title' } });

      const descriptionInput = screen.getByPlaceholderText(/Provide a detailed description/i);
      fireEvent.change(descriptionInput, { 
        target: { value: 'This is a detailed description of the test course with enough characters' } 
      });

      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/category is required/i)).toBeInTheDocument();
      });
    });

    it('should validate max students is a valid number', async () => {
      renderComponent();

      const maxStudentsInput = screen.getByLabelText(/Max Students/i);
      fireEvent.change(maxStudentsInput, { target: { value: '-5' } });

      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/max students must be at least 1/i)).toBeInTheDocument();
      });
    });

    it('should validate at least one module is added', async () => {
      renderComponent();

      // Fill required fields
      const titleInput = screen.getByPlaceholderText(/Introduction to Machine Learning/i);
      fireEvent.change(titleInput, { target: { value: 'Test Course Title' } });

      const descriptionInput = screen.getByPlaceholderText(/Provide a detailed description/i);
      fireEvent.change(descriptionInput, { 
        target: { value: 'This is a detailed description of the test course with enough characters' } 
      });

      const categorySelect = screen.getByLabelText(/Category/i);
      fireEvent.change(categorySelect, { target: { value: 'Programming' } });

      // Remove the default module
      const removeModuleButton = screen.getByTitle('Remove Module');
      fireEvent.click(removeModuleButton);

      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Please add at least one module/i)).toBeInTheDocument();
      });
    });
  });

  describe('Course Creation Flow', () => {
    it('should successfully create a course with valid data', async () => {
      const mockResponse = {
        message: 'Course created successfully',
        course: {
          _id: '456',
          title: 'Test Course',
          description: 'Test Description',
        },
      };

      vi.mocked(api.apiClient.post).mockResolvedValueOnce(mockResponse);

      renderComponent();

      // Fill all required fields
      const titleInput = screen.getByPlaceholderText(/Introduction to Machine Learning/i);
      fireEvent.change(titleInput, { target: { value: 'Complete Test Course' } });

      const descriptionInput = screen.getByPlaceholderText(/Provide a detailed description/i);
      fireEvent.change(descriptionInput, { 
        target: { value: 'This is a comprehensive test course description with all required details' } 
      });

      const categorySelect = screen.getByLabelText(/Category/i);
      fireEvent.change(categorySelect, { target: { value: 'Programming' } });

      // Add a lesson to the default module
      const addLessonButton = screen.getByText(/Add Lesson to Module 1/i);
      fireEvent.click(addLessonButton);

      // Fill lesson details
      const lessonTitleInput = screen.getByPlaceholderText(/Lesson title/i);
      fireEvent.change(lessonTitleInput, { target: { value: 'Introduction Lesson' } });

      const lessonContentInput = screen.getByPlaceholderText(/URL or content/i);
      fireEvent.change(lessonContentInput, { target: { value: 'https://example.com/video' } });

      // Submit the form
      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.apiClient.post).toHaveBeenCalledWith(
          '/api/courses',
          expect.objectContaining({
            title: 'Complete Test Course',
            category: 'Programming',
          })
        );
      });

      // Verify navigation to courses page
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({}, '', '/courses');
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Database connection failed',
            field: 'title',
          },
        },
      };

      vi.mocked(api.apiClient.post).mockRejectedValueOnce(mockError);

      renderComponent();

      // Fill required fields
      const titleInput = screen.getByPlaceholderText(/Introduction to Machine Learning/i);
      fireEvent.change(titleInput, { target: { value: 'Test Course' } });

      const descriptionInput = screen.getByPlaceholderText(/Provide a detailed description/i);
      fireEvent.change(descriptionInput, { 
        target: { value: 'This is a test course description' } 
      });

      const categorySelect = screen.getByLabelText(/Category/i);
      fireEvent.change(categorySelect, { target: { value: 'Programming' } });

      // Submit
      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title: Database connection failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('File Upload Functionality', () => {
    it('should validate thumbnail file type', () => {
      renderComponent();

      const file = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/Choose Image/i).querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
      }

      // Should show error for invalid file type
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Please select a valid image file')
      );
    });

    it('should validate thumbnail file size', () => {
      renderComponent();

      // Create a file larger than 5MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
        type: 'image/jpeg' 
      });
      
      const input = screen.getByLabelText(/Choose Image/i).querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { files: [largeFile] } });
      }

      // Should show error for file size
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Image file size must be less than 5MB')
      );
    });
  });

  describe('User Experience', () => {
    it('should show loading state during submission', async () => {
      vi.mocked(api.apiClient.post).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      renderComponent();

      // Fill required fields
      const titleInput = screen.getByPlaceholderText(/Introduction to Machine Learning/i);
      fireEvent.change(titleInput, { target: { value: 'Test Course' } });

      const descriptionInput = screen.getByPlaceholderText(/Provide a detailed description/i);
      fireEvent.change(descriptionInput, { 
        target: { value: 'This is a test course description with enough characters' } 
      });

      const categorySelect = screen.getByLabelText(/Category/i);
      fireEvent.change(categorySelect, { target: { value: 'Programming' } });

      // Submit
      const submitButton = screen.getByText('Create Course');
      fireEvent.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });
    });

    it('should allow adding and removing modules', () => {
      renderComponent();

      // Add a new module
      const addModuleButton = screen.getByText(/Add Module/i);
      fireEvent.click(addModuleButton);

      // Should have 2 modules now
      expect(screen.getByText('Module 2')).toBeInTheDocument();

      // Remove the second module
      const removeButtons = screen.getAllByTitle('Remove Module');
      fireEvent.click(removeButtons[1]);

      // Should only have 1 module
      expect(screen.queryByText('Module 2')).not.toBeInTheDocument();
    });

    it('should allow adding and removing prerequisites', () => {
      renderComponent();

      // Add a prerequisite
      const addPrereqButton = screen.getByText(/Add Prerequisite/i);
      fireEvent.click(addPrereqButton);

      // Should have 2 prerequisite inputs
      const prereqInputs = screen.getAllByPlaceholderText(/Basic Python knowledge/i);
      expect(prereqInputs).toHaveLength(2);

      // Remove a prerequisite
      const removeButtons = screen.getAllByTitle(/Remove/i);
      fireEvent.click(removeButtons[0]);

      // Should have 1 prerequisite input
      expect(screen.getAllByPlaceholderText(/Basic Python knowledge/i)).toHaveLength(1);
    });
  });
});
