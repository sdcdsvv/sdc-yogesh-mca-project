// Teacher-specific TypeScript interfaces for API responses

export interface TeacherStats {
  active_courses: number;
  total_students: number;
  pending_grades: number;
  course_rating: number;
  monthly_growth: {
    courses: number;
    students: number;
    rating_change: number;
  };
}

export interface TeacherAnalytics {
  dashboard_stats: TeacherStats;
}

export interface AssignmentStats {
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

export interface TeacherCourse {
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
  average_progress: number;
  active_students: number;
  engagement_rate: number;
  completion_rate: number;
  total_assignments: number;
  total_submissions: number;
  graded_submissions: number;
  pending_submissions: number;
  average_grade: number;
  student_performance: {
    excellent: number;
    good: number;
    average: number;
    needs_improvement: number;
  };
  created_at: string;
  updated_at: string;
}

export interface TeacherStudent {
  id: string;
  name: string;
  email: string;
  roll_no: string;
  department: string;
  enrolled_at: string;
  progress: number;
  is_active: boolean;
}

export interface CourseStudent extends TeacherStudent {
  course_id: string;
  course_title: string;
}

export interface StudentAnalytics {
  student_name: string;
  roll_no: string;
  department: string;
  total_points: number;
  courses_enrolled: number;
  assignments_submitted: number;
  overall_assignment_average: number;
  course_performance: CoursePerformance[];
  progress_timeline: ProgressTimelineItem[];
}

export interface CoursePerformance {
  course_title: string;
  progress: number;
  assignments_submitted: number;
  total_assignments: number;
  average_assignment_grade: number;
}

export interface ProgressTimelineItem {
  date: string;
  course: string;
  progress: number;
}

export interface TeacherDashboardData {
  stats: TeacherStats;
  courses: TeacherCourse[];
  recent_activities: RecentActivity[];
  assignment_stats: AssignmentStats;
}

export interface RecentActivity {
  type: 'submission' | 'enrollment' | 'assignment' | 'course';
  student_name?: string;
  assignment_title?: string;
  course_title?: string;
  submitted_at?: string;
  enrolled_at?: string;
  created_at?: string;
  status: string;
  title?: string;
  date?: string;
}