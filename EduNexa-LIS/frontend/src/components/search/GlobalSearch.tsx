import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  BookOpen, 
  FileText, 
  Users, 
  Video, 
  Calendar,
  TrendingUp,
  X,
  Loader2
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'course' | 'assignment' | 'student' | 'teacher' | 'video' | 'schedule';
  title: string;
  subtitle?: string;
  description?: string;
  link: string;
  icon: React.ReactNode;
}

export const GlobalSearch: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    setShowResults(true);

    try {
      const token = localStorage.getItem('token');
      const searchResults: SearchResult[] = [];

      // Search based on user role
      if (user?.role === 'student') {
        // Student searches: courses, assignments, videos, schedule
        await Promise.all([
          searchCourses(query, token, searchResults),
          searchAssignments(query, token, searchResults),
          searchVideos(query, token, searchResults),
        ]);
      } else if (user?.role === 'teacher') {
        // Teacher searches: courses, assignments, students, videos, analytics
        await Promise.all([
          searchCourses(query, token, searchResults),
          searchAssignments(query, token, searchResults),
          searchStudents(query, token, searchResults),
          searchVideos(query, token, searchResults),
        ]);
      } else if (user?.role === 'super_admin') {
        // Admin searches: everything
        await Promise.all([
          searchCourses(query, token, searchResults),
          searchAssignments(query, token, searchResults),
          searchStudents(query, token, searchResults),
          searchTeachers(query, token, searchResults),
          searchVideos(query, token, searchResults),
        ]);
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const searchCourses = async (query: string, token: string | null, results: SearchResult[]) => {
    try {
      const response = await fetch('http://192.160.108.56:5010/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const courses = data.courses || [];
        
        courses
          .filter((course: any) => 
            course.title?.toLowerCase().includes(query.toLowerCase()) ||
            course.description?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
          .forEach((course: any) => {
            results.push({
              id: course._id,
              type: 'course',
              title: course.title,
              subtitle: course.teacher_name || 'Course',
              description: course.description?.substring(0, 100),
              link: `/courses/${course._id}`,
              icon: <BookOpen className="h-5 w-5 text-blue-600" />
            });
          });
      }
    } catch (error) {
      console.error('Course search error:', error);
    }
  };

  const searchAssignments = async (query: string, token: string | null, results: SearchResult[]) => {
    try {
      const response = await fetch('http://192.160.108.56:5010/api/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const assignments = data.assignments || [];
        
        assignments
          .filter((assignment: any) => 
            assignment.title?.toLowerCase().includes(query.toLowerCase()) ||
            assignment.description?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
          .forEach((assignment: any) => {
            results.push({
              id: assignment._id,
              type: 'assignment',
              title: assignment.title,
              subtitle: `Due: ${new Date(assignment.due_date).toLocaleDateString()}`,
              description: assignment.description?.substring(0, 100),
              link: `/assignments/${assignment._id}`,
              icon: <FileText className="h-5 w-5 text-green-600" />
            });
          });
      }
    } catch (error) {
      console.error('Assignment search error:', error);
    }
  };

  const searchStudents = async (query: string, token: string | null, results: SearchResult[]) => {
    try {
      const response = await fetch(`http://192.160.108.56:5010/api/test-users/search?q=${encodeURIComponent(query)}&role=student`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const students = data.results || [];
        
        students
          .slice(0, 5)
          .forEach((student: any) => {
            results.push({
              id: student._id,
              type: 'student',
              title: student.name,
              subtitle: student.email,
              description: `${student.department} • ${student.roll_number || 'N/A'}`,
              link: `/students/${student._id}`,
              icon: <Users className="h-5 w-5 text-purple-600" />
            });
          });
      }
    } catch (error) {
      console.error('Student search error:', error);
    }
  };

  const searchTeachers = async (query: string, token: string | null, results: SearchResult[]) => {
    try {
      const response = await fetch(`http://192.160.108.56:5010/api/test-users/search?q=${encodeURIComponent(query)}&role=teacher`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const teachers = data.results || [];
        
        teachers
          .slice(0, 5)
          .forEach((teacher: any) => {
            results.push({
              id: teacher._id,
              type: 'teacher',
              title: teacher.name,
              subtitle: teacher.email,
              description: `${teacher.department} • ${teacher.designation || 'Teacher'}`,
              link: `/teachers/${teacher._id}`,
              icon: <Users className="h-5 w-5 text-orange-600" />
            });
          });
      }
    } catch (error) {
      console.error('Teacher search error:', error);
    }
  };

  const searchVideos = async (query: string, token: string | null, results: SearchResult[]) => {
    try {
      const response = await fetch('http://192.160.108.56:5010/api/videos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const videos = data.videos || [];
        
        videos
          .filter((video: any) => 
            video.title?.toLowerCase().includes(query.toLowerCase()) ||
            video.description?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5)
          .forEach((video: any) => {
            results.push({
              id: video._id,
              type: 'video',
              title: video.title,
              subtitle: video.course_name || 'Video',
              description: video.description?.substring(0, 100),
              link: `/videos/${video._id}`,
              icon: <Video className="h-5 w-5 text-red-600" />
            });
          });
      }
    } catch (error) {
      console.error('Video search error:', error);
    }
  };

  const handleResultClick = (link: string) => {
    setSearchQuery('');
    setShowResults(false);
    window.history.pushState({}, '', link);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none z-10" />
      
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
        placeholder={
          user?.role === 'student' ? 'Search courses, assignments...' :
          user?.role === 'teacher' ? 'Search courses, students...' :
          'Search anything...'
        }
        className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />

      {searchQuery && (
        <button
          onClick={clearSearch}
          className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
        </button>
      )}

      {isSearching && (
        <div className="absolute right-8 sm:right-10 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result.link)}
                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      <span className="text-xs text-gray-500 capitalize flex-shrink-0">
                        {result.type}
                      </span>
                    </div>
                    {result.subtitle && (
                      <p className="text-xs text-gray-600 truncate">
                        {result.subtitle}
                      </p>
                    )}
                    {result.description && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {result.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.length >= 2 && !isSearching ? (
            <div className="py-8 text-center">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No results found for "{searchQuery}"</p>
              <p className="text-xs text-gray-500 mt-1">Try different keywords</p>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="py-8 text-center">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Type at least 2 characters to search</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
