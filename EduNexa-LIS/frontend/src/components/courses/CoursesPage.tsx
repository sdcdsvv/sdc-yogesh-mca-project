import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLMS } from '../../contexts/LMSContext';
import { CourseCard } from '../dashboard/CourseCard';
import {
  Search,
  Filter,
  Grid,
  List,
  SortAsc,
  Plus,
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  Eye,
  BarChart3
} from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const { user } = useAuth();
  const { courses, fetchCourses } = useLMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('title');
  const [showArchived, setShowArchived] = useState(false);
  const isTeacher = user?.role === 'teacher';

  const handleCourseClick = (courseId: string) => {
    // Navigate to course detail page with proper route
    window.history.pushState({}, '', `/courses/${courseId}`);
    window.dispatchEvent(new Event('navigation'));
  };

  const handleCourseUpdate = () => {
    // Refresh courses list after update/delete
    if (fetchCourses) {
      fetchCourses();
    }
  };

  const categories = [
    'all',
    'AI & Machine Learning',
    'Programming',
    'Data Science',
    'Web Development',
    'Mobile Development',
    'Database',
    'Cloud Computing',
    'Cybersecurity',
    'DevOps'
  ];

  

  const filteredCourses = courses
    .filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(course => filterCategory === 'all' || course.category === filterCategory)
    .filter(course => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'active') return course.progress < 100;
      if (filterStatus === 'completed') return course.progress === 100;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'progress': return (b.progress || 0) - (a.progress || 0);
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'students': return (b.students || 0) - (a.students || 0);
        case 'recent': return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default: return 0;
      }
    });

  const activeCourses = filteredCourses.filter(course => course.is_active !== false);
  const archivedCourses = filteredCourses.filter(course => course.is_active === false);
  const visibleCourses = isTeacher
    ? (showArchived ? archivedCourses : activeCourses)
    : filteredCourses;

  const stats = {
    total: visibleCourses.length,
    active: visibleCourses.filter(c => (c.progress || 0) < 100).length,
    completed: visibleCourses.filter(c => c.progress === 100).length,
    totalStudents: visibleCourses.reduce((sum, c) => sum + (c.students || 0), 0)
  };

  const totalMatchingCourses = isTeacher
    ? (showArchived ? archivedCourses.length : activeCourses.length)
    : filteredCourses.length;

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
            <p className="text-sm sm:text-base text-gray-600">
              {isTeacher ? 'Create and manage your courses' : 'Manage and continue your learning journey'}
            </p>
          </div>
          {isTeacher && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {archivedCourses.length > 0 && (
                <button
                  onClick={() => setShowArchived((prev) => !prev)}
                  className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {showArchived ? 'Show Active Courses' : `View Archived (${archivedCourses.length})`}
                </button>
              )}
              <a
                href="/courses/create"
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                Create Course
              </a>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Courses</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          {!isTeacher && (
            <>
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Avg Progress</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {stats.total > 0 ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / stats.total) : 0}%
                </p>
              </div>
            </>
          )}

          {isTeacher && (
            <>
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Avg Rating</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {stats.total > 0 ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / stats.total).toFixed(1) : '0.0'}
                </p>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Active Courses</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter (Students only) */}
            {!isTeacher && (
              <div className="flex items-center gap-2 flex-1">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

            {/* Sort */}
            <div className="flex items-center gap-2 flex-1">
              <SortAsc className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="title">Title</option>
                <option value="recent">Most Recent</option>
                {!isTeacher && <option value="progress">Progress</option>}
                <option value="rating">Rating</option>
                {isTeacher && <option value="students">Students</option>}
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{visibleCourses.length}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalMatchingCourses}</span>{' '}
        {isTeacher && showArchived ? 'archived courses' : 'courses'}
      </div>

      {/* Courses Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
          : 'space-y-4'
      }>
        {visibleCourses.length > 0 ? (
          visibleCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              viewMode={viewMode} 
              isTeacher={isTeacher}
              onClick={() => handleCourseClick(course.id)}
              onUpdate={handleCourseUpdate}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-4">
              {showArchived
                ? 'No archived courses to display'
                : searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : isTeacher
                  ? 'Start by creating your first course'
                  : 'No courses enrolled yet'}
            </p>
            {isTeacher && (
              <a
                href="/courses/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Your First Course
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};