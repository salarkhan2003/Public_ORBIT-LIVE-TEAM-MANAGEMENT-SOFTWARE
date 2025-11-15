import { motion } from 'framer-motion';
import { X, Edit2, Trash2, Calendar, Clock, MapPin, Users, Tag, Bell, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface CalendarEventData {
  id: string;
  title: string;
  start: string;
  end: string;
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

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEventData;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventDetailsModal({ isOpen, onClose, event, onEdit, onDelete }: EventDetailsModalProps) {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
        return;
      }

      toast.success('Event deleted successfully');
      onDelete();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  if (!isOpen || !event) return null;

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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: event.color || '#3b82f6' }}
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {event.title}
                </h2>
              </div>
              {event.extendedProps?.priority && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  event.extendedProps.priority === 'high' ? 'bg-red-100 text-red-700' :
                  event.extendedProps.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {event.extendedProps.priority.toUpperCase()} PRIORITY
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Time */}
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {format(new Date(event.start), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
              </p>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {event.description}
              </p>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {event.location}
              </p>
            </div>
          )}

          {/* Assignees */}
          {event.extendedProps?.assignees && event.extendedProps.assignees.length > 0 && (
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {event.extendedProps.assignees.length} attendee(s)
                </p>
              </div>
            </div>
          )}

          {/* Recurrence */}
          {event.extendedProps?.recurrence && event.extendedProps.recurrence !== 'none' && (
            <div className="flex items-start space-x-3">
              <Repeat className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                Repeats {event.extendedProps.recurrence}
              </p>
            </div>
          )}

          {/* Reminder */}
          {event.extendedProps?.reminder && event.extendedProps.reminder > 0 && (
            <div className="flex items-start space-x-3">
              <Bell className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reminder {event.extendedProps.reminder} minutes before
              </p>
            </div>
          )}

          {/* Status */}
          {event.extendedProps?.status && (
            <div className="flex items-start space-x-3">
              <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                event.extendedProps.status === 'completed' ? 'bg-green-100 text-green-700' :
                event.extendedProps.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                event.extendedProps.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {event.extendedProps.status}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end space-x-3">
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
          <button
            onClick={onEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

