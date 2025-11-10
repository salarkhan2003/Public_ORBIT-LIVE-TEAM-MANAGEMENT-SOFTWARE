import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, Video, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Meeting, User } from '../types';
import { useGroup } from '../hooks/useGroup';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export function Calendar() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const { currentGroup, groupMembers } = useGroup();
  const { user } = useAuth();

  useEffect(() => {
    if (currentGroup) {
      fetchMeetings();
    }
  }, [currentGroup, currentMonth]);

  const fetchMeetings = async () => {
    if (!currentGroup) return;

    try {
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);

      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          creator:created_by(id, name, avatar)
        `)
        .eq('group_id', currentGroup.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => 
      isSameDay(new Date(meeting.start_time), date)
    );
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'in_progress':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Schedule and manage team meetings
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Meeting</span>
        </button>
      </div>

      {/* Calendar Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Today
            </button>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-600">
              {(['month', 'week', 'day'] as const).map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-3 py-1 text-sm capitalize ${
                    view === viewType
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${viewType === 'month' ? 'rounded-l-lg' : viewType === 'day' ? 'rounded-r-lg' : ''}`}
                >
                  {viewType}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {getDaysInMonth().map((day) => {
            const dayMeetings = getMeetingsForDate(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[100px] p-2 border border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${!isCurrentMonth ? 'opacity-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentDay
                    ? 'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayMeetings.slice(0, 2).map((meeting) => (
                    <div
                      key={meeting.id}
                      className="text-xs p-1 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 truncate"
                    >
                      {format(new Date(meeting.start_time), 'HH:mm')} {meeting.title}
                    </div>
                  ))}
                  {dayMeetings.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayMeetings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Meetings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Meetings for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>

        <div className="space-y-4">
          {getMeetingsForDate(selectedDate).map((meeting) => (
            <div key={meeting.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {meeting.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </div>
                  
                  {meeting.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {meeting.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(meeting.start_time), 'HH:mm')} - {format(new Date(meeting.end_time), 'HH:mm')}
                      </span>
                    </div>
                    
                    {meeting.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                    
                    {meeting.meeting_link && (
                      <div className="flex items-center space-x-2">
                        <Video className="w-4 h-4" />
                        <a
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{meeting.attendees.length} attendees</span>
                    </div>
                  </div>
                </div>

                {meeting.created_by === user?.id && (
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {getMeetingsForDate(selectedDate).length === 0 && (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No meetings scheduled
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create a new meeting for this date
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <CreateMeetingModal
          onClose={() => setShowCreateModal(false)}
          onMeetingCreated={fetchMeetings}
          groupMembers={groupMembers}
          currentGroup={currentGroup}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}

interface CreateMeetingModalProps {
  onClose: () => void;
  onMeetingCreated: () => void;
  groupMembers: any[];
  currentGroup: any;
  selectedDate: Date;
}

function CreateMeetingModal({ onClose, onMeetingCreated, groupMembers, currentGroup, selectedDate }: CreateMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
    end_time: format(new Date(selectedDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    location: '',
    meeting_link: '',
    attendees: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentGroup) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('meetings')
        .insert({
          ...formData,
          group_id: currentGroup.id,
          created_by: user.id,
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString(),
        });

      if (error) throw error;
      
      toast.success('Meeting created successfully');
      onMeetingCreated();
      onClose();
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Create New Meeting
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meeting Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Conference Room A, Online, etc."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meeting Link (Optional)
              </label>
              <input
                type="url"
                value={formData.meeting_link}
                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                placeholder="https://zoom.us/j/..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Meeting'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}