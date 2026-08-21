import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CourseAPI } from '../services/courseAPI';
import { AssignmentAPI } from '../services/assignmentAPI';
import { notificationsAPI } from '../config/api';

interface Course {
  createdAt: number;
  duration: string;
  id: string;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  thumbnail: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  students: number;
  is_active: boolean;
  // Optional fields for backward compatibility
  courseId: string;
  _id: string;
}

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  description: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'info' | 'warning' | 'success';
}

interface LMSContextType {
  courses: Course[];
  assignments: Assignment[];
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  fetchCourses: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  refreshData: () => Promise<void>;
  lastRefreshTime: Date | null;
  enableAutoRefresh: boolean;
  setEnableAutoRefresh: (enable: boolean) => void;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (context === undefined) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};

export const LMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // State for real data
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh state
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [enableAutoRefresh, setEnableAutoRefresh] = useState(true);
  
  // Auto-refresh interval (5 minutes)
  const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;

  // Data fetching methods
  const fetchCourses = useCallback(async () => {
    try {
      setError(null);
      
      const apiCourses = await CourseAPI.getCourses();
      
      console.log('Raw API courses:', apiCourses);
      
      // Transform backend data to match frontend format
      const transformedCourses: Course[] = apiCourses
        .filter((course: any) => {
          // For students, only show enrolled courses
          // For teachers, show all their courses
          return course.is_enrolled !== false;
        })
        .map((course: any) => {
          // Ensure we have a valid ID from multiple possible sources
          const courseId = course._id || course.course_id || course.id;
          
          if (!courseId) {
            console.error('Course missing ID after transformation:', course);
            return null; // Return null for courses without IDs
          }
          
          const transformed: Course = {
            id: courseId,
            title: course.title || 'Untitled Course',
            description: course.description || '',
            instructor: course.teacher_name || 'Instructor',
            progress: course.progress || course.average_progress || 0,
            totalLessons: course.materials?.length || 0,
            completedLessons: Math.floor(((course.progress || course.average_progress || 0) / 100) * (course.materials?.length || 0)),
            thumbnail: course.thumbnail || 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
            category: course.category || 'General',
            difficulty: (course.difficulty as 'Beginner' | 'Intermediate' | 'Advanced') || 'Beginner',
            rating: 4.5, // Default rating - could be enhanced with real rating data
            students: course.enrolled_students || 0,
            createdAt: course.created_at ? new Date(course.created_at).getTime() : Date.now(),
            duration: course.duration || 'N/A',
            is_active: course.is_active !== false,
            // Keep original IDs for backward compatibility
            courseId: courseId,
            _id: courseId
          };
          
          return transformed;
        })
        .filter((course): course is Course => course !== null); // Remove any null entries
      
      console.log('Transformed courses:', transformedCourses);
      
      setCourses(transformedCourses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      setError(errorMessage);
      console.error('Failed to fetch courses:', err);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      setError(null);
      
      const apiAssignments = await AssignmentAPI.getAssignments();
      
      // Transform backend data to match frontend format
      const transformedAssignments: Assignment[] = apiAssignments.map((assignment) => ({
        id: assignment._id,
        title: assignment.title,
        courseId: assignment.course_id,
        dueDate: assignment.due_date,
        status: assignment.submission_status || 'pending',
        grade: assignment.submission?.grade,
        description: assignment.description
      }));
      
      setAssignments(transformedAssignments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assignments';
      setError(errorMessage);
      console.error('Failed to fetch assignments:', err);
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setError(null);
      
      const apiNotifications = await notificationsAPI.getAll(false, 20);
      
      // Transform notifications to announcements format
      const transformedAnnouncements: Announcement[] = (apiNotifications as any).notifications?.map((notification: any) => ({
        id: notification._id,
        title: notification.title,
        content: notification.message,
        date: notification.created_at,
        type: notification.type === 'alert' ? 'warning' : 'info'
      })) || [];
      
      setAnnouncements(transformedAnnouncements);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch announcements';
      setError(errorMessage);
      console.error('Failed to fetch announcements:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel for better performance
      await Promise.all([
        fetchCourses(),
        fetchAssignments(),
        fetchAnnouncements()
      ]);
      
      // Update last refresh time
      setLastRefreshTime(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
      console.error('Failed to refresh data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchCourses, fetchAssignments, fetchAnnouncements]);

  // Initial data load on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh mechanism
  useEffect(() => {
    if (!enableAutoRefresh) {
      return;
    }

    const intervalId = setInterval(() => {
      console.log('Auto-refreshing LMS data...');
      refreshData();
    }, AUTO_REFRESH_INTERVAL);

    // Cleanup interval on unmount or when auto-refresh is disabled
    return () => {
      clearInterval(intervalId);
    };
  }, [enableAutoRefresh, refreshData, AUTO_REFRESH_INTERVAL]);

  // Listen for visibility change to refresh data when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enableAutoRefresh) {
        // Check if it's been more than 1 minute since last refresh
        const now = new Date();
        if (!lastRefreshTime || (now.getTime() - lastRefreshTime.getTime()) > 60000) {
          console.log('Tab became visible, refreshing data...');
          refreshData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableAutoRefresh, lastRefreshTime, refreshData]);

  return (
    <LMSContext.Provider value={{
      courses,
      assignments,
      announcements,
      loading,
      error,
      sidebarOpen,
      setSidebarOpen,
      selectedCourse,
      setSelectedCourse,
      fetchCourses,
      fetchAssignments,
      fetchAnnouncements,
      refreshData,
      lastRefreshTime,
      enableAutoRefresh,
      setEnableAutoRefresh
    }}>
      {children}
    </LMSContext.Provider>
  );
};