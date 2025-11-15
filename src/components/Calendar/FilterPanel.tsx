import { motion } from 'framer-motion';
import { X, Filter } from 'lucide-react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    projects: string[];
    assignees: string[];
    priorities: string[];
    statuses: string[];
  };
  onFiltersChange: (filters: any) => void;
  events: any[];
}

export function FilterPanel({ isOpen, onClose, filters, onFiltersChange, events }: FilterPanelProps) {
  const priorities = ['low', 'medium', 'high'];
  const statuses = ['scheduled', 'in-progress', 'completed', 'cancelled'];

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    const currentFilters = filters[category];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(item => item !== value)
      : [...currentFilters, value];

    onFiltersChange({
      ...filters,
      [category]: newFilters
    });
  };

  const clearAll = () => {
    onFiltersChange({
      projects: [],
      assignees: [],
      priorities: [],
      statuses: []
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 space-y-6">
          {/* Priority Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Priority
            </h3>
            <div className="space-y-2">
              {priorities.map(priority => (
                <label
                  key={priority}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.priorities.includes(priority)}
                    onChange={() => toggleFilter('priorities', priority)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white capitalize">
                    {priority}
                  </span>
                  <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                    priority === 'high' ? 'bg-red-100 text-red-700' :
                    priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {events.filter(e => e.extendedProps?.priority === priority).length}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Status
            </h3>
            <div className="space-y-2">
              {statuses.map(status => (
                <label
                  key={status}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(status)}
                    onChange={() => toggleFilter('statuses', status)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white capitalize">
                    {status.replace('-', ' ')}
                  </span>
                  <span className="ml-auto text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {events.filter(e => e.extendedProps?.status === status).length}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Clear All */}
          <button
            onClick={clearAll}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Clear All Filters
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

