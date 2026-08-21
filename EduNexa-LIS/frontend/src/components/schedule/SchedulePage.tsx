import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MapPin,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useLMS } from '../../contexts/LMSContext';
import ScheduleAPI, { ScheduleEvent } from '../../services/scheduleAPI';
import { Toast } from '../common/Toast';

type CalendarEvent = ScheduleEvent;

export const SchedulePage: React.FC = () => {
  const { courses, assignments } = useLMS();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'class' as CalendarEvent['type'],
    startTime: '',
    endTime: '',
    date: '',
    location: '',
    courseId: ''
  });

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchEvents = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await ScheduleAPI.getEvents();
      
      console.log('Fetched events from backend:', data); // Debug log
      
      // Convert assignments to schedule events with better formatting
      const assignmentEvents: CalendarEvent[] = assignments.map(assignment => {
        const dueDate = new Date(assignment.dueDate);
        const dateStr = dueDate.toISOString().split('T')[0];
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Find course title
        const course = courses.find(c => c.id === assignment.courseId);
        const courseTitle = course?.title || 'Unknown Course';
        
        // Determine color based on status and urgency
        let color = 'bg-red-500'; // Default for pending
        if (assignment.status === 'graded') {
          color = 'bg-green-500';
        } else if (assignment.status === 'submitted') {
          color = 'bg-yellow-500';
        } else if (daysUntilDue <= 1 && daysUntilDue >= 0) {
          color = 'bg-red-600'; // Urgent - due today or tomorrow
        } else if (daysUntilDue <= 3 && daysUntilDue > 1) {
          color = 'bg-orange-500'; // Due soon
        }
        
        // Add detailed status to description
        const statusText = assignment.status === 'pending' ? 'Not Submitted' : 
                          assignment.status === 'submitted' ? 'Submitted - Awaiting Grade' :
                          `Graded: ${assignment.grade || 'N/A'}`;
        
        const urgencyText = daysUntilDue < 0 ? '⚠️ OVERDUE' :
                           daysUntilDue === 0 ? '🔥 DUE TODAY' :
                           daysUntilDue === 1 ? '⏰ DUE TOMORROW' :
                           daysUntilDue <= 3 ? `📅 Due in ${daysUntilDue} days` :
                           `📅 Due in ${daysUntilDue} days`;
        
        const fullDescription = `📚 Course: ${courseTitle}\n\n${assignment.description}\n\n📊 Status: ${statusText}\n${urgencyText}`;
        
        return {
          id: `assignment-${assignment.id}`,
          title: `📝 ${assignment.title}`,
          description: fullDescription,
          type: 'deadline' as const,
          date: dateStr,
          startTime: '23:59',
          endTime: '23:59',
          courseId: assignment.courseId,
          courseTitle: courseTitle,
          color: color,
          isShared: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });
      
      // Combine user events and assignment events
      const allEvents = [...data, ...assignmentEvents];
      console.log('Total events (user + assignments):', allEvents.length); // Debug log
      setEvents(allEvents);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load schedule.';
      setError(message);
      console.error('Error fetching events:', err); // Debug log
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [assignments, courses]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getWeekDates = (date: Date) => {
    const week = [];
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day;
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      week.push(currentDate);
    }
    return week;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const weekDates = getWeekDates(currentDate);

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime) {
      setToast({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setCreatingEvent(true);
    try {
      console.log('Creating event:', newEvent); // Debug log
      
      const createdEvent = await ScheduleAPI.createEvent({
        title: newEvent.title,
        description: newEvent.description,
        type: newEvent.type,
        date: newEvent.date,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        location: newEvent.location,
        courseId: newEvent.courseId || undefined
      });

      console.log('Event created successfully:', createdEvent); // Debug log

      // Reset form
      setNewEvent({
        title: '',
        description: '',
        type: 'class' as CalendarEvent['type'],
        startTime: '',
        endTime: '',
        date: '',
        location: '',
        courseId: ''
      });
      setShowAddEventModal(false);
      setToast({ type: 'success', message: 'Event added successfully! Refreshing calendar...' });
      
      // Refresh all events from backend
      console.log('Fetching updated events...'); // Debug log
      await fetchEvents();
      console.log('Events refreshed'); // Debug log
    } catch (err) {
      console.error('Error creating event:', err); // Debug log
      const message = err instanceof Error ? err.message : 'Failed to create event.';
      setToast({ type: 'error', message });
    } finally {
      setCreatingEvent(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule</h1>
            <p className="text-gray-600">Manage your classes and events</p>
          </div>
          <button 
            onClick={() => setShowAddEventModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>
        
        {/* Assignment Status Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            <span className="text-gray-600">Pending Assignment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⏳</span>
            <span className="text-gray-600">Submitted Assignment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span className="text-gray-600">Graded Assignment</span>
          </div>
        </div>
      </div>

      {/* Upcoming Assignments Section */}
      {!loading && !error && assignments.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Upcoming Assignments (Next 7 Days)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments
              .filter(assignment => {
                const dueDate = new Date(assignment.dueDate);
                const today = new Date();
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return daysUntilDue >= 0 && daysUntilDue <= 7 && assignment.status === 'pending';
              })
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 6)
              .map(assignment => {
                const dueDate = new Date(assignment.dueDate);
                const today = new Date();
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const course = courses.find(c => c.id === assignment.courseId);
                
                const urgencyColor = daysUntilDue === 0 ? 'bg-red-100 border-red-300 text-red-800' :
                                    daysUntilDue === 1 ? 'bg-orange-100 border-orange-300 text-orange-800' :
                                    'bg-blue-100 border-blue-300 text-blue-800';
                
                const urgencyText = daysUntilDue === 0 ? '🔥 Due Today!' :
                                   daysUntilDue === 1 ? '⏰ Due Tomorrow' :
                                   `📅 ${daysUntilDue} days left`;
                
                return (
                  <div key={assignment.id} className={`p-4 rounded-lg border-2 ${urgencyColor}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{assignment.title}</h3>
                      <span className="text-xs font-bold whitespace-nowrap ml-2">{urgencyText}</span>
                    </div>
                    <p className="text-xs opacity-75 mb-2">📚 {course?.title || 'Unknown Course'}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span>Due: {dueDate.toLocaleDateString()}</span>
                      <span className="font-medium">23:59</span>
                    </div>
                  </div>
                );
              })}
            {assignments.filter(assignment => {
              const dueDate = new Date(assignment.dueDate);
              const today = new Date();
              const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return daysUntilDue >= 0 && daysUntilDue <= 7 && assignment.status === 'pending';
            }).length === 0 && (
              <div className="col-span-full text-center py-4 text-gray-600">
                🎉 No pending assignments in the next 7 days!
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-red-700 font-medium">
            <AlertTriangle className="h-5 w-5" />
            Error loading schedule
          </div>
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchEvents();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your schedule...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigateWeek('prev')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={goToToday}
                className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Today
              </button>
              <button 
                onClick={() => navigateWeek('next')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}

            {weekDates.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-100 ${isToday ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                >
                  <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => {
                      const isAssignment = event.id.startsWith('assignment-');
                      const statusIcon = isAssignment ? 
                        (event.color === 'bg-green-500' ? '✅ ' : 
                         event.color === 'bg-yellow-500' ? '⏳ ' : '📝 ') : '';
                      
                      return (
                        <button
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className={`w-full text-left p-1 rounded text-xs text-white truncate ${event.color} hover:opacity-80`}
                        >
                          {isAssignment ? statusIcon : formatTime(event.startTime) + ' '}
                          {event.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add New Event</h2>
              <button
                onClick={() => {
                  setShowAddEventModal(false);
                  setNewEvent({
                    title: '',
                    description: '',
                    type: 'class' as CalendarEvent['type'],
                    startTime: '',
                    endTime: '',
                    date: '',
                    location: '',
        courseId: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter event title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="class">Class</option>
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="exam">Exam</option>
                  <option value="office-hours">Office Hours</option>
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Course Name and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course (Optional)
                  </label>
                  <select
                    value={newEvent.courseId}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, courseId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">General</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Room 101 or Online"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add event description or notes..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddEventModal(false);
                  setNewEvent({
                    title: '',
                    description: '',
                    type: 'class',
                    startTime: '',
                    endTime: '',
                    date: '',
                    location: '',
        courseId: ''
                  });
                }}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                disabled={creatingEvent}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {creatingEvent ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${selectedEvent.color}`}></div>
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {selectedEvent.id.startsWith('assignment-') ? 'Assignment Deadline' : selectedEvent.type}
                </span>
                {selectedEvent.id.startsWith('assignment-') && (
                  <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                    selectedEvent.color === 'bg-green-500' ? 'bg-green-100 text-green-700' :
                    selectedEvent.color === 'bg-yellow-500' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedEvent.color === 'bg-green-500' ? 'Graded' :
                     selectedEvent.color === 'bg-yellow-500' ? 'Submitted' :
                     'Pending'}
                  </span>
                )}
              </div>

              {selectedEvent.courseTitle && (
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{selectedEvent.courseTitle}</span>
                </div>
              )}

              {!selectedEvent.id.startsWith('assignment-') && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">
                    {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {selectedEvent.id.startsWith('assignment-') && ' (Due Date)'}
                </span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.description && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};