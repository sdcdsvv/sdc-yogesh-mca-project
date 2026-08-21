// Course API Service Module
import { apiClient, API_ENDPOINTS } from '../config/api';

// Course-related interfaces
export interface Course {
  _id: string;
  course_id: string;
  title: string;
  description: string;
  category: string;
  teacher_id: string;
  teacher_name: string;
  teacher_email: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  prerequisites: string[];
  learning_objectives: string[];
  thumbnail: string;
  is_active: boolean;
  is_public: boolean;
  max_students: number;
  enrolled_students: number;
  average_progress?: number;
  active_students?: number;
  engagement_rate?: number;
  completion_rate?: number;
  total_assignments?: number;
  total_submissions?: number;
  graded_submissions?: number;
  pending_submissions?: number;
  average_grade?: number;
  student_performance?: {
    excellent: number;
    good: number;
    average: number;
    needs_improvement: number;
  };
  created_at: string;
  updated_at: string;
  materials?: Material[];
  assignments?: Assignment[];
}

export interface Material {
  _id: string;
  course_id: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'document' | 'link';
  content: string;
  filename?: string;
  url?: string;
  duration?: string;
  order: number;
  is_required: boolean;
  uploaded_by: string;
  created_at: string;
  views?: number;
  completed_by?: string[];
}

export interface Assignment {
  _id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  created_at: string;
}

export interface CourseStudent {
  id: string;
  name: string;
  email: string;
  roll_no: string;
  department: string;
  enrolled_at: string;
  progress: number;
  is_active: boolean;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  category: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  prerequisites?: string[];
  learning_objectives?: string[];
  thumbnail?: string;
  is_public?: boolean;
  max_students?: number;
  modules?: CourseModule[];
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  prerequisites?: string[];
  learning_objectives?: string[];
  thumbnail?: string;
  is_active?: boolean;
  is_public?: boolean;
  max_students?: number;
}

export interface CourseModule {
  title: string;
  description?: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  title: string;
  description?: string;
  type: 'video' | 'document' | 'link';
  content: string;
  order?: number;
  is_required?: boolean;
}

export interface MaterialUploadRequest {
  title: string;
  description?: string;
  type: 'video' | 'pdf' | 'document' | 'link';
  content: string;
  order?: number;
  is_required?: boolean;
}

export interface VideoUploadRequest {
  title: string;
  description?: string;
  order?: number;
  duration?: string;
  video: File;
}

export class CourseAPI {
  /**
   * Get all courses for the current teacher
   */
  static async getCourses(): Promise<Course[]> {
    try {
      const response = await apiClient.get<{ courses: Course[] }>(
        API_ENDPOINTS.COURSES.BASE
      );
      return response.courses;
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      throw new Error('Failed to load courses');
    }
  }

  /**
   * Get a specific course by ID
   */
  static async getCourseById(courseId: string): Promise<Course> {
    try {
      const response = await apiClient.get<{ course: Course }>(
        API_ENDPOINTS.COURSES.BY_ID(courseId)
      );
      return response.course;
    } catch (error) {
      console.error('Failed to fetch course:', error);
      throw new Error('Failed to load course details');
    }
  }

  /**
   * Create a new course
   */
  static async createCourse(courseData: CreateCourseRequest): Promise<Course> {
    try {
      const response = await apiClient.post<{ course: Course; message: string }>(
        API_ENDPOINTS.COURSES.BASE,
        courseData
      );
      return response.course;
    } catch (error) {
      console.error('Failed to create course:', error);
      throw new Error('Failed to create course');
    }
  }

  /**
   * Update an existing course
   */
  static async updateCourse(courseId: string, courseData: UpdateCourseRequest): Promise<Course> {
    try {
      const response = await apiClient.put<{ course: Course; message: string }>(
        API_ENDPOINTS.COURSES.BY_ID(courseId),
        courseData
      );
      return response.course;
    } catch (error) {
      console.error('Failed to update course:', error);
      throw new Error('Failed to update course');
    }
  }

  /**
   * Delete a course (deactivate)
   */
  static async deleteCourse(courseId: string): Promise<void> {
    try {
      await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.COURSES.BY_ID(courseId)
      );
    } catch (error) {
      console.error('Failed to delete course:', error);
      throw new Error('Failed to delete course');
    }
  }

  /**
   * Get students enrolled in a specific course
   */
  static async getCourseStudents(courseId: string): Promise<CourseStudent[]> {
    try {
      const response = await apiClient.get<{ students: CourseStudent[] }>(
        API_ENDPOINTS.COURSES.STUDENTS(courseId)
      );
      return response.students;
    } catch (error) {
      console.error('Failed to fetch course students:', error);
      throw new Error('Failed to load course students');
    }
  }

  /**
   * Upload course material (non-video)
   */
  static async uploadMaterial(courseId: string, materialData: MaterialUploadRequest): Promise<Material> {
    try {
      const response = await apiClient.post<{ material: Material; message: string }>(
        API_ENDPOINTS.COURSES.MATERIALS(courseId),
        materialData
      );
      return response.material;
    } catch (error) {
      console.error('Failed to upload material:', error);
      throw new Error('Failed to upload course material');
    }
  }

  /**
   * Upload video material
   */
  static async uploadVideo(courseId: string, videoData: VideoUploadRequest): Promise<Material> {
    try {
      const formData = new FormData();
      formData.append('video', videoData.video);
      formData.append('title', videoData.title);
      if (videoData.description) {
        formData.append('description', videoData.description);
      }
      if (videoData.order !== undefined) {
        formData.append('order', videoData.order.toString());
      }
      if (videoData.duration) {
        formData.append('duration', videoData.duration);
      }

      // Use fetch directly for file upload
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_ENDPOINTS.COURSES.BY_ID(courseId)}/upload-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload video');
      }

      const result = await response.json();
      return result.video;
    } catch (error) {
      console.error('Failed to upload video:', error);
      throw new Error('Failed to upload video');
    }
  }

  /**
   * Get course materials
   */
  static async getCourseMaterials(courseId: string): Promise<Material[]> {
    try {
      const course = await this.getCourseById(courseId);
      return course.materials || [];
    } catch (error) {
      console.error('Failed to fetch course materials:', error);
      throw new Error('Failed to load course materials');
    }
  }

  /**
   * Update course progress for a student
   */
  static async updateCourseProgress(
    courseId: string,
    materialId: string,
    completed: boolean,
    watchTime?: number
  ): Promise<void> {
    try {
      await apiClient.post(
        `${API_ENDPOINTS.COURSES.BY_ID(courseId)}/progress`,
        {
          material_id: materialId,
          completed,
          watch_time: watchTime || 0,
        }
      );
    } catch (error) {
      console.error('Failed to update course progress:', error);
      throw new Error('Failed to update progress');
    }
  }

  /**
   * Enroll a student in a course (for admin/teacher use)
   */
  static async enrollStudent(courseId: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.COURSES.ENROLL(courseId));
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      throw new Error('Failed to enroll in course');
    }
  }

  /**
   * Unenroll a student from a course
   */
  static async unenrollStudent(courseId: string): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.COURSES.UNENROLL(courseId));
    } catch (error) {
      console.error('Failed to unenroll from course:', error);
      throw new Error('Failed to unenroll from course');
    }
  }

  /**
   * Get course statistics for teacher dashboard
   */
  static async getCourseStatistics(courseId: string): Promise<{
    enrolled_students: number;
    active_students: number;
    completion_rate: number;
    engagement_rate: number;
    average_progress: number;
  }> {
    try {
      const course = await this.getCourseById(courseId);
      return {
        enrolled_students: course.enrolled_students,
        active_students: course.active_students || 0,
        completion_rate: course.completion_rate || 0,
        engagement_rate: course.engagement_rate || 0,
        average_progress: course.average_progress || 0,
      };
    } catch (error) {
      console.error('Failed to fetch course statistics:', error);
      throw new Error('Failed to load course statistics');
    }
  }

  /**
   * Get all courses with enhanced statistics for teacher dashboard
   */
  static async getCoursesWithStats(): Promise<Course[]> {
    try {
      const courses = await this.getCourses();
      // The backend already provides enhanced statistics for teacher role
      return courses;
    } catch (error) {
      console.error('Failed to fetch courses with statistics:', error);
      throw new Error('Failed to load courses with statistics');
    }
  }

  /**
   * Duplicate a course
   */
  static async duplicateCourse(courseId: string, newTitle: string): Promise<Course> {
    try {
      const originalCourse = await this.getCourseById(courseId);
      
      const duplicateData: CreateCourseRequest = {
        title: newTitle,
        description: originalCourse.description,
        category: originalCourse.category,
        difficulty: originalCourse.difficulty,
        duration: originalCourse.duration,
        prerequisites: originalCourse.prerequisites,
        learning_objectives: originalCourse.learning_objectives,
        thumbnail: originalCourse.thumbnail,
        is_public: originalCourse.is_public,
        max_students: originalCourse.max_students,
      };

      return await this.createCourse(duplicateData);
    } catch (error) {
      console.error('Failed to duplicate course:', error);
      throw new Error('Failed to duplicate course');
    }
  }

  /**
   * Archive a course (set as inactive)
   */
  static async archiveCourse(courseId: string): Promise<Course> {
    try {
      return await this.updateCourse(courseId, { is_active: false });
    } catch (error) {
      console.error('Failed to archive course:', error);
      throw new Error('Failed to archive course');
    }
  }

  /**
   * Restore an archived course
   */
  static async restoreCourse(courseId: string): Promise<Course> {
    try {
      return await this.updateCourse(courseId, { is_active: true });
    } catch (error) {
      console.error('Failed to restore course:', error);
      throw new Error('Failed to restore course');
    }
  }

  /**
   * Get course enrollment analytics
   */
  static async getCourseEnrollmentAnalytics(courseId: string): Promise<{
    total_enrollments: number;
    active_enrollments: number;
    completion_rate: number;
    dropout_rate: number;
    enrollment_trend: Array<{ date: string; count: number }>;
  }> {
    try {
      const [course, students] = await Promise.all([
        this.getCourseById(courseId),
        this.getCourseStudents(courseId),
      ]);

      const activeStudents = students.filter(s => s.is_active).length;
      const completedStudents = students.filter(s => s.progress >= 100).length;
      
      return {
        total_enrollments: course.enrolled_students,
        active_enrollments: activeStudents,
        completion_rate: course.enrolled_students > 0 ? (completedStudents / course.enrolled_students) * 100 : 0,
        dropout_rate: course.enrolled_students > 0 ? ((course.enrolled_students - activeStudents) / course.enrolled_students) * 100 : 0,
        enrollment_trend: [], // This would need additional backend support
      };
    } catch (error) {
      console.error('Failed to fetch enrollment analytics:', error);
      throw new Error('Failed to load enrollment analytics');
    }
  }
}

export default CourseAPI;