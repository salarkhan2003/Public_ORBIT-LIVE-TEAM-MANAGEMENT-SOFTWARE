import React from 'react';
import { Clock, CheckCircle, Plus, Edit, FolderPlus, Upload, Calendar, UserPlus, UserMinus, Activity } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
  };
  time: string;
  icon: string;
  color: string;
}

interface RealTimeActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const iconMap = {
  Plus,
  Edit,
  CheckCircle,
  FolderPlus,
  Upload,
  Calendar,
  UserPlus,
  UserMinus,
  Activity
};

export function RealTimeActivity({ activities, loading }: RealTimeActivityProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || Activity;
            
            return (
              <div key={activity.id} className="flex items-start space-x-3 group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700 ${activity.color} transition-all duration-200 group-hover:scale-105`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <img
                      src={activity.user.avatar || `https://ui-avatars.com/api/?name=${activity.user.name}&background=3B82F6&color=fff&size=32`}
                      alt={activity.user.name}
                      className="w-5 h-5 rounded-full"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}