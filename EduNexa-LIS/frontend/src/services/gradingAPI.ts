/**
 * Grading API Service
 * Handles all grading-related API calls
 */

import { apiClient } from '../config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.160.108.56:5010/api';

export interface RubricItem {
  criterion: string;
  score: number;
  max_score: number;
  comments: string;
}

export interface GradeSubmissionRequest {
  grade?: number;
  feedback?: string;
  rubric_scores?: RubricItem[];
  is_final?: boolean;
  release_grade?: boolean;
}

export interface Submission {
  _id: string;
  assignment_id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  student_roll_no?: string;
  text_content?: string;
  file_name?: string;
  file_path?: string;
  submitted_at: string;
  status: string;
  grade?: number;
  feedback?: string;
  rubric_scores?: RubricItem[];
  is_final?: boolean;
  grade_released?: boolean;
  graded_at?: string;
  graded_by?: string;
  grader_name?: string;
  assignment_title?: string;
  assignment_max_points?: number;
  course_title?: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  user_id: string;
  user_name?: string;
  submission_id: string;
  details: any;
  timestamp: string;
  ip_address: string;
}

export class GradingAPI {
  /**
   * Grade a submission with optional rubric
   */
  static async gradeSubmission(
    submissionId: string,
    gradeData: GradeSubmissionRequest
  ): Promise<{
    message: string;
    grade: number;
    max_points: number;
    percentage: number;
    is_final: boolean;
    released: boolean;
  }> {
    try {
      const response = await apiClient.post<any>(
        `${API_BASE_URL}/grading/submissions/${submissionId}/grade`,
        gradeData
      );
      return response;
    } catch (error: any) {
      console.error('Failed to grade submission:', error);
      throw new Error(error.message || 'Failed to submit grade');
    }
  }

  /**
   * Release a previously hidden grade
   */
  static async releaseGrade(submissionId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${API_BASE_URL}/grading/submissions/${submissionId}/release`
      );
      return response;
    } catch (error: any) {
      console.error('Failed to release grade:', error);
      throw new Error(error.message || 'Failed to release grade');
    }
  }

  /**
   * Hide a grade from student
   */
  static async hideGrade(submissionId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${API_BASE_URL}/grading/submissions/${submissionId}/hide`
      );
      return response;
    } catch (error: any) {
      console.error('Failed to hide grade:', error);
      throw new Error(error.message || 'Failed to hide grade');
    }
  }

  /**
   * Mark a grade as final
   */
  static async finalizeGrade(submissionId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${API_BASE_URL}/grading/submissions/${submissionId}/finalize`
      );
      return response;
    } catch (error: any) {
      console.error('Failed to finalize grade:', error);
      throw new Error(error.message || 'Failed to finalize grade');
    }
  }

  /**
   * Get detailed submission information
   */
  static async getSubmissionDetails(submissionId: string): Promise<Submission> {
    try {
      const response = await apiClient.get<{ submission: Submission }>(
        `${API_BASE_URL}/grading/submissions/${submissionId}`
      );
      return response.submission;
    } catch (error: any) {
      console.error('Failed to fetch submission details:', error);
      throw new Error(error.message || 'Failed to load submission details');
    }
  }

  /**
   * Get all submissions for an assignment (teacher only)
   */
  static async getAssignmentSubmissions(assignmentId: string): Promise<{
    submissions: Submission[];
    total: number;
    graded: number;
    pending: number;
  }> {
    try {
      const response = await apiClient.get<{
        submissions: Submission[];
        total: number;
        graded: number;
        pending: number;
      }>(`${API_BASE_URL}/grading/assignments/${assignmentId}/submissions`);
      return response;
    } catch (error: any) {
      console.error('Failed to fetch assignment submissions:', error);
      throw new Error(error.message || 'Failed to load submissions');
    }
  }

  /**
   * Get audit logs for a submission (teacher/admin only)
   */
  static async getAuditLogs(submissionId: string): Promise<AuditLog[]> {
    try {
      const response = await apiClient.get<{ audit_logs: AuditLog[] }>(
        `${API_BASE_URL}/grading/audit-logs/${submissionId}`
      );
      return response.audit_logs;
    } catch (error: any) {
      console.error('Failed to fetch audit logs:', error);
      throw new Error(error.message || 'Failed to load audit logs');
    }
  }

  /**
   * Bulk grade multiple submissions
   */
  static async bulkGrade(
    grades: Array<{ submissionId: string; gradeData: GradeSubmissionRequest }>
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      const results = await Promise.allSettled(
        grades.map(({ submissionId, gradeData }) =>
          this.gradeSubmission(submissionId, gradeData)
        )
      );

      const success = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      const errors = results
        .filter((r) => r.status === 'rejected')
        .map((r: any) => r.reason?.message || 'Unknown error');

      return { success, failed, errors };
    } catch (error: any) {
      console.error('Failed to bulk grade:', error);
      throw new Error(error.message || 'Failed to bulk grade submissions');
    }
  }

  /**
   * Get grading statistics for a teacher
   */
  static async getGradingStats(): Promise<{
    total_submissions: number;
    graded: number;
    pending: number;
    average_grade: number;
    average_turnaround_time: number;
  }> {
    try {
      // This would need a backend endpoint
      // For now, return mock data
      return {
        total_submissions: 0,
        graded: 0,
        pending: 0,
        average_grade: 0,
        average_turnaround_time: 0
      };
    } catch (error: any) {
      console.error('Failed to fetch grading stats:', error);
      throw new Error(error.message || 'Failed to load grading statistics');
    }
  }

  /**
   * Export grades to CSV
   */
  static async exportGrades(assignmentId: string): Promise<Blob> {
    try {
      const submissions = await this.getAssignmentSubmissions(assignmentId);
      
      // Create CSV content
      const headers = ['Student Name', 'Email', 'Roll No', 'Grade', 'Max Points', 'Percentage', 'Status', 'Submitted At', 'Graded At'];
      const rows = submissions.submissions.map(sub => [
        sub.student_name || '',
        sub.student_email || '',
        sub.student_roll_no || '',
        sub.grade || '',
        sub.assignment_max_points || '',
        sub.grade && sub.assignment_max_points ? ((sub.grade / sub.assignment_max_points) * 100).toFixed(2) + '%' : '',
        sub.status,
        new Date(sub.submitted_at).toLocaleString(),
        sub.graded_at ? new Date(sub.graded_at).toLocaleString() : ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return new Blob([csvContent], { type: 'text/csv' });
    } catch (error: any) {
      console.error('Failed to export grades:', error);
      throw new Error(error.message || 'Failed to export grades');
    }
  }

  /**
   * Download exported grades
   */
  static async downloadGrades(assignmentId: string, assignmentTitle: string): Promise<void> {
    try {
      const blob = await this.exportGrades(assignmentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${assignmentTitle.replace(/[^a-z0-9]/gi, '_')}_grades.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Failed to download grades:', error);
      throw new Error(error.message || 'Failed to download grades');
    }
  }
}

export default GradingAPI;
