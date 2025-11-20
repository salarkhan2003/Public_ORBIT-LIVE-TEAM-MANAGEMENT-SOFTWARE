import React from 'react';
import { Calendar, Clock, Flag, User } from 'lucide-react';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  type: 'task' | 'project';
  assignee?: {
    name: string;
    avatar?: string;
  };
}

interface UpcomingDeadlinesProps {
  deadlines: Deadline[];
  loading?: boolean;
}

export function UpcomingDeadlines({ deadlines, loading }: UpcomingDeadlinesProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getUrgencyColor = (dueDate: string) => {
    const date = new Date(dueDate);
    const daysUntil = differenceInDays(date, new Date());
    
    if (daysUntil <= 1) return 'border-l-red-500';
    if (daysUntil <= 3) return 'border-l-yellow-500';
    return 'border-l-blue-500';
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    
    if (isToday(date)) return 'Due today';
    if (isTomorrow(date)) return 'Due tomorrow';
    
    const daysUntil = differenceInDays(date, new Date());
    if (daysUntil > 0 && daysUntil <= 7) {
      return `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
    }
    
    return `Due ${format(date, 'MMM dd, yyyy')}`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upcoming Deadlines
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2" />
        Upcoming Deadlines
      </h3>
      
      <div className="space-y-3">
        {deadlines.length > 0 ? (
          deadlines.map((deadline) => (
            <div
              key={deadline.id}
              className={`border-l-4 ${getUrgencyColor(deadline.dueDate)} bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {deadline.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      ({deadline.type})
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDueDate(deadline.dueDate)}</span>
                    </div>
                    
                    {deadline.assignee && (
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <img
                          src={deadline.assignee.avatar || `https://ui-avatars.com/api/?name=${deadline.assignee.name}&background=3B82F6&color=fff&size=24`}
                          alt={deadline.assignee.name}
                          className="w-4 h-4 rounded-full"
                        />
                        <span>{deadline.assignee.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getPriorityColor(deadline.priority)}`}>
                    <Flag className="w-3 h-3 inline mr-1" />
                    {deadline.priority}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No upcoming deadlines
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              You're all caught up! No deadlines in the next 7 days.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}