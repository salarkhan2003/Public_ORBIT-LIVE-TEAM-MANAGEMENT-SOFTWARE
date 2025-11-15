import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users, Tag, Bell, Repeat, Save, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useGroup } from '../../hooks/useGroup';
import toast from 'react-hot-toast';

interface CalendarEventData {
  id?: string;
  title?: string;
  start?: string;
  end?: string;
  description?: string;
  location?: string;
  color?: string;
  allDay?: boolean;
  extendedProps?: {
    priority?: string;
    status?: string;
    assignees?: string[];
    project_id?: string;
    recurrence?: string;
    reminder?: number;
  };
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEventData;
  initialDate?: Date | null;
  onSave: () => void;
}

export function EventModal({ isOpen, onClose, event, initialDate, onSave }: EventModalProps) {
  const { user } = useAuth();
  const { currentGroup, groupMembers } = useGroup();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    all_day: false,
    color: '#3b82f6',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'scheduled' as 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
    assignees: [] as string[],
    project_id: '',
    recurrence: 'none' as 'none' | 'daily' | 'weekly' | 'monthly',
    reminder: 30 as number
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      // Edit mode
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start_time: event.start || '',
        end_time: event.end || '',
        location: event.location || '',
        all_day: event.allDay || false,
        color: event.color || '#3b82f6',
        priority: (event.extendedProps?.priority as 'low' | 'medium' | 'high') || 'medium',
        status: (event.extendedProps?.status as 'scheduled' | 'in-progress' | 'completed' | 'cancelled') || 'scheduled',
        assignees: event.extendedProps?.assignees || [],
        project_id: event.extendedProps?.project_id || '',
        recurrence: (event.extendedProps?.recurrence as 'none' | 'daily' | 'weekly' | 'monthly') || 'none',
        reminder: event.extendedProps?.reminder || 30
      });
    } else if (initialDate) {
      // New event with initial date
      const startTime = format(initialDate, "yyyy-MM-dd'T'HH:mm");
      const endDate = new Date(initialDate);
      endDate.setHours(endDate.getHours() + 1);
      const endTime = format(endDate, "yyyy-MM-dd'T'HH:mm");

      setFormData(prev => ({
        ...prev,
        start_time: startTime,
        end_time: endTime
      }));
    }
  }, [event, initialDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }

    if (formData.start_time && formData.end_time) {
      if (new Date(formData.end_time) <= new Date(formData.start_time)) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!currentGroup || !user) {
      toast.error('Missing group or user information');
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        ...formData,
        group_id: currentGroup.id,
        created_by: user.id
      };

      if (event?.id) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast.success('Event updated successfully!');
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast.success('Event created successfully!');
      }

      onSave();
    } catch (error) {
      console.error('Error saving event:', error);
      const message = error instanceof Error ? error.message : 'Failed to save event';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Calendar className="w-6 h-6" />
              <span>{event ? 'Edit Event' : 'New Event'}</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Team meeting, deadline, etc."
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4" />
                <span>Start Time *</span>
              </label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.start_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.start_time && (
                <p className="mt-1 text-sm text-red-500">{errors.start_time}</p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4" />
                <span>End Time *</span>
              </label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.end_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.end_time && (
                <p className="mt-1 text-sm text-red-500">{errors.end_time}</p>
              )}
            </div>
          </div>

          {/* All Day Event */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="all_day"
              checked={formData.all_day}
              onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="all_day" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              All day event
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add event details..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Meeting room, video call link, etc."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4" />
                <span>Priority</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'scheduled' | 'in-progress' | 'completed' | 'cancelled' })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-4 h-4" />
              <span>Assignees</span>
            </label>
            <select
              multiple
              value={formData.assignees}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, assignees: selected });
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              size={4}
            >
              {groupMembers.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.users?.name || member.users?.email}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
          </div>

          {/* Recurrence and Reminder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Repeat className="w-4 h-4" />
                <span>Repeat</span>
              </label>
              <select
                value={formData.recurrence}
                onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as 'none' | 'daily' | 'weekly' | 'monthly' })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Bell className="w-4 h-4" />
                <span>Reminder</span>
              </label>
              <select
                value={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="0">No reminder</option>
                <option value="5">5 minutes before</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-12 w-24 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{formData.color}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{event ? 'Update Event' : 'Create Event'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

