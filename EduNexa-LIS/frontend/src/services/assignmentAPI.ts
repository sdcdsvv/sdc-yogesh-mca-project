// Assignment API Service Module
import { apiClient, API_ENDPOINTS } from '../config/api';

// Assignment-related interfaces
export interface Assignment {
  _id: string;
  title: string;
  description: string;
  course_id: string;
  course_title?: string;
  instructions?: string;
  due_date: string;
  max_points: number;
  submission_type: 'file' | 'text' | 'both';
  allowed_file_types: string[];
  max_file_size: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  submission_status?: 'pending' | 'submitted' | 'graded';
  submission_count?: number;
  submissions?: AssignmentSubmission[];
  submission?: AssignmentSubmission;
}

export interface AssignmentSubmission {
  _id: string;
  assignment_id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  roll_no?: string;
  course_id: string;
  text_content: string;
  file_path: string;
  file_name: string;
  submitted_at: string;
  status: 'submitted' | 'graded';
  grade?: number;
  feedback: string;
  graded_at?: string;
  graded_by?: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
  course_id: string;
  instructions?: string;
  due_date: string;
  max_points?: number;
  submission_type?: 'file' | 'text' | 'both';
  allowed_file_types?: string[];
  max_file_size?: number;
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  instructions?: string;
  due_date?: string;
  max_points?: number;
  submission_type?: 'file' | 'text' | 'both';
  allowed_file_types?: string[];
  max_file_size?: number;
  is_active?: boolean;
}

export interface SubmitAssignmentRequest {
  text_content?: string;
  file_path?: string;
  file_name?: string;
}

export interface GradeSubmissionRequest {
  grade: number;
  feedback?: string;
}

export interface AssignmentStatistics {
  total_assignments: number;
  pending_submissions: number;
  graded_submissions: number;
  completion_rate: number;
  average_grade: number;
  grading_workload: GradingWorkloadItem[];
  assignment_performance: AssignmentPerformance[];
}

export interface GradingWorkloadItem {
  assignment_id: string;
  assignment_title: string;
  course_title: string;
  due_date: string;
  pending_submissions: number;
  total_submissions: number;
  priority: 'high' | 'medium' | 'low';
}

export interface AssignmentPerformance {
  assignment_id: string;
  assignment_title: string;
  course_title: string;
  max_points: number;
  total_submissions: number;
  graded_submissions: number;
  submission_rate: number;
  average_grade: number;
  grade_percentage: number;
  due_date: string;
  created_at: string;
}

export class AssignmentAPI {
  /**
   * Get all assignments for the current user (role-based)
   * For teachers: Returns assignments from courses they created with submission counts
   * For students: Returns assignments from enrolled courses with submission status
   */
  static async getAssignments(): Promise<Assignment[]> {
    try {
      const response = await apiClient.get<{ assignments: Assignment[] }>(
        API_ENDPOINTS.ASSIGNMENTS.BASE
      );
      
      // Verify response structure
      if (!response.assignments || !Array.isArray(response.assignments)) {
        console.error('Invalid response structure from assignments endpoint:', response);
        throw new Error('Invalid response format from server');
      }
      
      return response.assignments;
    } catch (error: any) {
      console.error('Failed to fetch assignments:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('403')) {
        throw new Error('You do not have permission to access assignments.');
      } else if (error.message?.includes('401')) {
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.message?.includes('Invalid response format')) {
        throw error; // Re-throw the specific error
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      } else {
        throw new Error('Failed to load assignments. Please try again later.');
      }
    }
  }

  /**
   * Get a specific assignment by ID
   * For teachers: Includes all submissions with student information
   * For students: Includes their own submission if exists
   */
  static async getAssignmentById(assignmentId: string): Promise<Assignment> {
    try {
      const response = await apiClient.get<{ assignment: Assignment }>(
        API_ENDPOINTS.ASSIGNMENTS.BY_ID(assignmentId)
      );
      
      // Verify response structure
      if (!response.assignment) {
        console.error('Invalid response structure from assignment endpoint:', response);
        throw new Error('Invalid response format from server');
      }
      
      return response.assignment;
    } catch (error: any) {
      console.error('Failed to fetch assignment:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('404')) {
        throw new Error('Assignment not found. It may have been deleted.');
      } else if (error.message?.includes('403')) {
        throw new Error('You do not have permission to access this assignment.');
      } else if (error.message?.includes('401')) {
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.message?.includes('Invalid response format')) {
        throw error; // Re-throw the specific error
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      } else {
        throw new Error('Failed to load assignment details. Please try again later.');
      }
    }
  }

  /**
   * Get assignment details with all submissions (teacher/admin only)
   * This is an alias for getAssignmentById but more explicit about fetching submissions
   * Handles the case where assignment has no submissions gracefully
   */
  static async getAssignmentDetails(assignmentId: string): Promise<Assignment> {
    try {
      const assignment = await this.getAssignmentById(assignmentId);
      
      // Ensure submissions array exists even if empty
      if (!assignment.submissions) {
        assignment.submissions = [];
      }
      
      return assignment;
    } catch (error: any) {
      console.error('Failed to fetch assignment details:', error);
      
      // Re-throw with context
      if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to load assignment details with submissions.');
      }
    }
  }

  /**
   * Create a new assignment (teacher/admin only)
   */
  static async createAssignment(assignmentData: CreateAssignmentRequest): Promise<Assignment> {
    try {
      const response = await apiClient.post<{ assignment: Assignment; message: string }>(
        API_ENDPOINTS.ASSIGNMENTS.BASE,
        assignmentData
      );
      return response.assignment;
    } catch (error) {
      console.error('Failed to create assignment:', error);
      throw new Error('Failed to create assignment');
    }
  }

  /**
   * Update an existing assignment (teacher/admin only)
   */
  static async updateAssignment(assignmentId: string, assignmentData: UpdateAssignmentRequest): Promise<Assignment> {
    try {
      const response = await apiClient.put<{ assignment: Assignment; message: string }>(
        API_ENDPOINTS.ASSIGNMENTS.BY_ID(assignmentId),
        assignmentData
      );
      return response.assignment;
    } catch (error) {
      console.error('Failed to update assignment:', error);
      throw new Error('Failed to update assignment');
    }
  }

  /**
   * Delete an assignment
   */
  static async deleteAssignment(assignmentId: string): Promise<void> {
    try {
      await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.ASSIGNMENTS.BY_ID(assignmentId)
      );
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      throw new Error('Failed to delete assignment');
    }
  }

  /**
   * Submit an assignment (student only)
   */
  static async submitAssignment(assignmentId: string, submissionData: SubmitAssignmentRequest): Promise<AssignmentSubmission> {
    try {
      const response = await apiClient.post<{ submission: AssignmentSubmission; message: string }>(
        API_ENDPOINTS.ASSIGNMENTS.SUBMIT(assignmentId),
        submissionData
      );
      return response.submission;
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      throw new Error('Failed to submit assignment');
    }
  }

  /**
   * Grade a submission (teacher/admin only)
   */
  static async gradeSubmission(submissionId: string, gradeData: GradeSubmissionRequest): Promise<void> {
    try {
      // Validate grade data before sending
      if (gradeData.grade === undefined || gradeData.grade === null) {
        throw new Error('Grade is required');
      }
      
      if (gradeData.grade < 0) {
        throw new Error('Grade cannot be negative');
      }
      
      await apiClient.post<{ message: string }>(
        API_ENDPOINTS.ASSIGNMENTS.GRADE(submissionId),
        gradeData
      );
    } catch (error: any) {
      console.error('Failed to grade submission:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('Grade is required') || error.message?.includes('Grade cannot be negative')) {
        throw error; // Re-throw validation errors
      } else if (error.message?.includes('404')) {
        throw new Error('Submission not found. It may have been deleted.');
      } else if (error.message?.includes('403')) {
        throw new Error('You do not have permission to grade this submission.');
      } else if (error.message?.includes('401')) {
        throw new Error('Your session has expired. Please log in again.');
      } else if (error.message?.includes('400')) {
        // Backend validation error
        throw new Error('Invalid grade value. Please check the grade is within the allowed range.');
      } else if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      } else {
        throw new Error('Failed to submit grade. Please try again later.');
      }
    }
  }  /**
 
  * Get assignments for a specific course (teacher/admin only)
   */
  static async getCourseAssignments(courseId: string): Promise<Assignment[]> {
    try {
      const assignments = await this.getAssignments();
      return assignments.filter(assignment => assignment.course_id === courseId);
    } catch (error) {
      console.error('Failed to fetch course assignments:', error);
      throw new Error('Failed to load course assignments');
    }
  }

  /**
   * Get pending assignments for grading (teacher only)
   */
  static async getPendingAssignments(): Promise<Assignment[]> {
    try {
      const assignments = await this.getAssignments();
      return assignments.filter(assignment => 
        assignment.submission_count && assignment.submission_count > 0
      );
    } catch (error) {
      console.error('Failed to fetch pending assignments:', error);
      throw new Error('Failed to load pending assignments');
    }
  }

  /**
   * Get assignment statistics for teacher dashboard
   */
  static async getAssignmentStatistics(): Promise<AssignmentStatistics> {
    try {
      const assignments = await this.getAssignments();
      
      // Calculate basic statistics
      const totalAssignments = assignments.length;
      let totalSubmissions = 0;
      let gradedSubmissions = 0;
      let totalGrades = 0;
      let gradeCount = 0;

      const gradingWorkload: GradingWorkloadItem[] = [];
      const assignmentPerformance: AssignmentPerformance[] = [];

      for (const assignment of assignments) {
        const submissionCount = assignment.submission_count || 0;
        totalSubmissions += submissionCount;

        // Get detailed assignment data for statistics
        try {
          const detailedAssignment = await this.getAssignmentById(assignment._id);
          const submissions = detailedAssignment.submissions || [];
          
          const graded = submissions.filter(s => s.status === 'graded').length;
          gradedSubmissions += graded;
          
          // Calculate grades
          const grades = submissions
            .filter(s => s.grade !== undefined && s.grade !== null)
            .map(s => s.grade!);
          
          if (grades.length > 0) {
            totalGrades += grades.reduce((sum, grade) => sum + grade, 0);
            gradeCount += grades.length;
          }

          // Add to grading workload if there are pending submissions
          const pendingCount = submissionCount - graded;
          if (pendingCount > 0) {
            const dueDate = new Date(assignment.due_date);
            const now = new Date();
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            let priority: 'high' | 'medium' | 'low' = 'low';
            if (daysUntilDue < 0) priority = 'high'; // Overdue
            else if (daysUntilDue <= 3) priority = 'high';
            else if (daysUntilDue <= 7) priority = 'medium';

            gradingWorkload.push({
              assignment_id: assignment._id,
              assignment_title: assignment.title,
              course_title: assignment.course_title || '',
              due_date: assignment.due_date,
              pending_submissions: pendingCount,
              total_submissions: submissionCount,
              priority
            });
          }

          // Add to assignment performance
          const avgGrade = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;
          const submissionRate = assignment.max_points > 0 ? (submissionCount / assignment.max_points) * 100 : 0;
          const gradePercentage = assignment.max_points > 0 ? (avgGrade / assignment.max_points) * 100 : 0;

          assignmentPerformance.push({
            assignment_id: assignment._id,
            assignment_title: assignment.title,
            course_title: assignment.course_title || '',
            max_points: assignment.max_points,
            total_submissions: submissionCount,
            graded_submissions: graded,
            submission_rate: submissionRate,
            average_grade: avgGrade,
            grade_percentage: gradePercentage,
            due_date: assignment.due_date,
            created_at: assignment.created_at
          });
        } catch (detailError) {
          console.warn(`Failed to get details for assignment ${assignment._id}:`, detailError);
        }
      }

      const pendingSubmissions = totalSubmissions - gradedSubmissions;
      const completionRate = totalSubmissions > 0 ? (gradedSubmissions / totalSubmissions) * 100 : 0;
      const averageGrade = gradeCount > 0 ? totalGrades / gradeCount : 0;

      return {
        total_assignments: totalAssignments,
        pending_submissions: pendingSubmissions,
        graded_submissions: gradedSubmissions,
        completion_rate: completionRate,
        average_grade: averageGrade,
        grading_workload: gradingWorkload.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }),
        assignment_performance: assignmentPerformance.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      };
    } catch (error) {
      console.error('Failed to calculate assignment statistics:', error);
      throw new Error('Failed to load assignment statistics');
    }
  } 
 /**
   * Get submissions for a specific assignment (teacher/admin only)
   */
  static async getAssignmentSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    try {
      const assignment = await this.getAssignmentById(assignmentId);
      return assignment.submissions || [];
    } catch (error) {
      console.error('Failed to fetch assignment submissions:', error);
      throw new Error('Failed to load assignment submissions');
    }
  }

  /**
   * Get student's submission for an assignment
   */
  static async getStudentSubmission(assignmentId: string): Promise<AssignmentSubmission | null> {
    try {
      const assignment = await this.getAssignmentById(assignmentId);
      return assignment.submission || null;
    } catch (error) {
      console.error('Failed to fetch student submission:', error);
      throw new Error('Failed to load submission');
    }
  }

  /**
   * Check if assignment deadline has passed
   */
  static isAssignmentOverdue(assignment: Assignment): boolean {
    return new Date() > new Date(assignment.due_date);
  }

  /**
   * Get days until assignment deadline
   */
  static getDaysUntilDeadline(assignment: Assignment): number {
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Format assignment deadline for display
   */
  static formatDeadline(assignment: Assignment): string {
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day(s)`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} day(s)`;
    }
  }

  /**
   * Get assignment priority based on deadline and submission status
   */
  static getAssignmentPriority(assignment: Assignment): 'high' | 'medium' | 'low' {
    const daysUntilDue = this.getDaysUntilDeadline(assignment);
    const pendingSubmissions = (assignment.submission_count || 0) - (assignment.submissions?.filter(s => s.status === 'graded').length || 0);

    if (daysUntilDue < 0 || (daysUntilDue <= 3 && pendingSubmissions > 0)) {
      return 'high';
    } else if (daysUntilDue <= 7 && pendingSubmissions > 0) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Bulk grade multiple submissions
   */
  static async bulkGradeSubmissions(grades: Array<{ submissionId: string; grade: number; feedback?: string }>): Promise<void> {
    try {
      const gradePromises = grades.map(({ submissionId, grade, feedback }) =>
        this.gradeSubmission(submissionId, { grade, feedback })
      );
      
      await Promise.all(gradePromises);
    } catch (error) {
      console.error('Failed to bulk grade submissions:', error);
      throw new Error('Failed to grade submissions');
    }
  }

  /**
   * Export assignment data for reporting
   */
  static async exportAssignmentData(assignmentId: string): Promise<{
    assignment: Assignment;
    submissions: AssignmentSubmission[];
    statistics: {
      totalSubmissions: number;
      gradedSubmissions: number;
      averageGrade: number;
      submissionRate: number;
    };
  }> {
    try {
      const assignment = await this.getAssignmentById(assignmentId);
      const submissions = assignment.submissions || [];
      
      const totalSubmissions = submissions.length;
      const gradedSubmissions = submissions.filter(s => s.status === 'graded').length;
      const grades = submissions.filter(s => s.grade !== undefined).map(s => s.grade!);
      const averageGrade = grades.length > 0 ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : 0;
      const submissionRate = assignment.max_points > 0 ? (totalSubmissions / assignment.max_points) * 100 : 0;

      return {
        assignment,
        submissions,
        statistics: {
          totalSubmissions,
          gradedSubmissions,
          averageGrade,
          submissionRate
        }
      };
    } catch (error) {
      console.error('Failed to export assignment data:', error);
      throw new Error('Failed to export assignment data');
    }
  }
}

export default AssignmentAPI;