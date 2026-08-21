/**
 * Course utility functions for normalizing course data
 */

export interface NormalizedCourse {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  instructor?: string;
  teacher_id?: string;
  teacher_name?: string;
  [key: string]: any;
}

/**
 * Normalize course object to ensure it has a valid ID
 * Checks both _id and id fields and returns a consistent object
 */
export const normalizeCourse = (course: any): NormalizedCourse | null => {
  if (!course) return null;

  // Get ID from either _id or id field
  const courseId = course._id || course.id || course.courseId;
  
  if (!courseId) {
    console.warn('Course missing ID:', course);
    return null;
  }

  // Return normalized course with both id and _id for compatibility
  return {
    ...course,
    id: courseId,
    _id: courseId
  };
};

/**
 * Get course ID from a course object
 * Returns the ID as a string, checking multiple possible fields
 */
export const getCourseId = (course: any): string | null => {
  if (!course) return null;
  return course._id || course.id || course.courseId || null;
};

/**
 * Normalize an array of courses
 */
export const normalizeCourses = (courses: any[]): NormalizedCourse[] => {
  if (!Array.isArray(courses)) return [];
  
  return courses
    .map(normalizeCourse)
    .filter((course): course is NormalizedCourse => course !== null);
};

/**
 * Check if a course has a valid ID
 */
export const hasValidCourseId = (course: any): boolean => {
  return !!(course && (course._id || course.id || course.courseId));
};
