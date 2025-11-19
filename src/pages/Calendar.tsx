import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Search,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useGroup } from '../hooks/useGroup';
import { EventModal } from '../components/Calendar/EventModal';
import { EventDetailsModal } from '../components/Calendar/EventDetailsModal';
import { FilterPanel } from '../components/Calendar/FilterPanel';
import toast from 'react-hot-toast';
import './Calendar.css';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  color?: string;
  allDay?: boolean;
  extendedProps: {
    assignees: string[];
    project_id?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: string;
    recurrence?: string;
    reminder?: number;
    created_by: string;
  };
}

export function Calendar() {
  const { currentGroup } = useGroup();
  const calendarRef = useRef<FullCalendar>(null);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false); // Start with false
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    projects: [] as string[],
    assignees: [] as string[],
    priorities: [] as string[],
    statuses: [] as string[]
  });

  // Fetch events from database
  const fetchEvents = async () => {
    if (!currentGroup) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('group_id', currentGroup.id)
        .order('start_time', { ascending: true });

      if (error) {
        // Check if table doesn't exist
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          console.error('Events table does not exist. Please run SETUP_CALENDAR_EVENTS.sql script.');
          toast.error('Calendar setup required. Please run the SQL script from SETUP_CALENDAR_EVENTS.sql');
          setEvents([]);
          setFilteredEvents([]);
          setLoading(false);
          return;
        }
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
        setLoading(false);
        return;
      }

      interface DatabaseEvent {
        id: string;
        title: string;
        start_time: string;
        end_time: string;
        description?: string;
        location?: string;
        color?: string;
        all_day?: boolean;
        priority?: string;
        status?: string;
        assignees?: string[];
        project_id?: string;
        recurrence?: string;
        reminder?: number;
        created_by: string;
      }

      const formattedEvents: CalendarEvent[] = (data || []).map((event: DatabaseEvent) => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        description: event.description,
        location: event.location,
        color: event.color || getPriorityColor(event.priority),
        allDay: event.all_day || false,
        extendedProps: {
          assignees: event.assignees || [],
          project_id: event.project_id,
          priority: (event.priority as 'low' | 'medium' | 'high') || undefined,
          status: event.status,
          recurrence: event.recurrence,
          reminder: event.reminder,
          created_by: event.created_by
        }
      }));

      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentGroup) {
      const timeout = setTimeout(() => setLoading(false), 3000);
      fetchEvents();

      // Real-time subscription for events
      const subscription = supabase
        .channel('calendar_events')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'events',
            filter: `group_id=eq.${currentGroup.id}`
          },
          () => {
            fetchEvents();
          }
        )
        .subscribe();

      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, [currentGroup]);

  // Apply filters
  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Priority filter
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(event =>
        filters.priorities.includes(event.extendedProps.priority || '')
      );
    }

    // Assignee filter
    if (filters.assignees.length > 0) {
      filtered = filtered.filter(event =>
        event.extendedProps.assignees.some(assignee =>
          filters.assignees.includes(assignee)
        )
      );
    }

    // Project filter
    if (filters.projects.length > 0) {
      filtered = filtered.filter(event =>
        filters.projects.includes(event.extendedProps.project_id || '')
      );
    }

    // Status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(event =>
        filters.statuses.includes(event.extendedProps.status || '')
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filters]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const handleDateSelect = (selectInfo: { start: Date; end: Date }) => {
    setSelectedDate(selectInfo.start);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    // Convert FullCalendar event to our CalendarEvent format
    const fcEvent = clickInfo.event;
    const calendarEvent: CalendarEvent = {
      id: fcEvent.id,
      title: fcEvent.title,
      start: fcEvent.startStr,
      end: fcEvent.endStr,
      description: fcEvent.extendedProps.description,
      location: fcEvent.extendedProps.location,
      color: fcEvent.backgroundColor,
      allDay: fcEvent.allDay,
      extendedProps: fcEvent.extendedProps
    };
    setSelectedEvent(calendarEvent);
    setShowDetailsModal(true);
  };

  const handleEventDrop = async (dropInfo: any) => {
    const { event } = dropInfo;

    try {
      const { error } = await supabase
        .from('events')
        .update({
          start_time: event.start?.toISOString() || '',
          end_time: event.end?.toISOString() || event.start?.toISOString() || ''
        })
        .eq('id', event.id);

      if (error) {
        console.error('Error updating event:', error);
        toast.error('Failed to reschedule event');
        dropInfo.revert();
        return;
      }

      toast.success('Event rescheduled successfully');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to reschedule event');
      dropInfo.revert();
    }
  };

  const handleEventResize = async (resizeInfo: any) => {
    const { event } = resizeInfo;

    try {
      const { error } = await supabase
        .from('events')
        .update({
          end_time: event.end?.toISOString() || event.start?.toISOString() || ''
        })
        .eq('id', event.id);

      if (error) {
        console.error('Error updating event:', error);
        toast.error('Failed to update event duration');
        resizeInfo.revert();
        return;
      }

      toast.success('Event duration updated');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event duration');
      resizeInfo.revert();
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(view);
    }
  };

  const handleNavigate = (action: 'prev' | 'next' | 'today') => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (action === 'today') {
        calendarApi.today();
      } else if (action === 'prev') {
        calendarApi.prev();
      } else {
        calendarApi.next();
      }
    }
  };

  const handleExportICS = async () => {
    try {
      // Generate ICS file content
      let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ORBIT LIVE TEAM//Calendar//EN\n';

      filteredEvents.forEach(event => {
        icsContent += 'BEGIN:VEVENT\n';
        icsContent += `UID:${event.id}\n`;
        icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
        icsContent += `DTSTART:${event.start.replace(/[-:]/g, '').split('.')[0]}Z\n`;
        icsContent += `DTEND:${event.end.replace(/[-:]/g, '').split('.')[0]}Z\n`;
        icsContent += `SUMMARY:${event.title}\n`;
        if (event.description) {
          icsContent += `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\n`;
        }
        if (event.location) {
          icsContent += `LOCATION:${event.location}\n`;
        }
        icsContent += 'END:VEVENT\n';
      });

      icsContent += 'END:VCALENDAR';

      // Download file
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `orbit-calendar-${format(new Date(), 'yyyy-MM-dd')}.ics`;
      link.click();

      toast.success('Calendar exported successfully');
    } catch (error) {
      console.error('Error exporting calendar:', error);
      toast.error('Failed to export calendar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full"
          />
          <p className="text-gray-600 dark:text-gray-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Show setup instructions if no events and likely table doesn't exist
  if (!loading && events.length === 0 && !currentGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Calendar Setup Required
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                To use the calendar feature, please run the SQL setup script
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                <span>Open Supabase SQL Editor</span>
              </h3>
              <a
                href="https://supabase.com/dashboard/project/iclnquvhushnvjzzcjrs/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 underline text-sm"
              >
                https://supabase.com/dashboard/project/.../sql/new
              </a>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                <span>Run SQL Script</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Copy the content from: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">supabase/SETUP_CALENDAR_EVENTS.sql</code>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Paste it in the SQL Editor and click <strong>RUN</strong>
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                <span>Refresh Page</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                After the SQL script runs successfully, refresh this page and your calendar will be ready!
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Need help? Check <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">CALENDAR_QUICK_START.md</code>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2 flex items-center space-x-3">
                <CalendarIcon className="w-10 h-10" />
                <span>Team Calendar</span>
              </h1>
              <p className="text-white/90 text-lg">
                Schedule, collaborate, and stay organized
              </p>
            </div>

            <motion.button
              onClick={() => {
                setSelectedDate(new Date());
                setSelectedEvent(null);
                setShowEventModal(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all shadow-xl font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>New Event</span>
            </motion.button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <button
              onClick={() => handleNavigate('today')}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-medium"
            >
              Today
            </button>

            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => handleNavigate('prev')}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => handleNavigate('next')}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-lg p-1">
              {['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek'].map((view) => (
                <button
                  key={view}
                  onClick={() => handleViewChange(view)}
                  className={`px-3 py-2 rounded-lg transition-all font-medium ${
                    currentView === view
                      ? 'bg-white text-purple-600'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {view === 'dayGridMonth' && 'Month'}
                  {view === 'timeGridWeek' && 'Week'}
                  {view === 'timeGridDay' && 'Day'}
                  {view === 'listWeek' && 'List'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-medium"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <button
              onClick={handleExportICS}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Calendar Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={currentView}
          headerToolbar={false}
          events={filteredEvents}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          height="auto"
          eventDisplay="block"
          displayEventTime={true}
          displayEventEnd={true}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
        />
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {showEventModal && (
          <EventModal
            isOpen={showEventModal}
            onClose={() => {
              setShowEventModal(false);
              setSelectedEvent(null);
              setSelectedDate(null);
            }}
            event={selectedEvent || undefined}
            initialDate={selectedDate}
            onSave={() => {
              fetchEvents();
              setShowEventModal(false);
              setSelectedEvent(null);
              setSelectedDate(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Event Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedEvent && (
          <EventDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedEvent(null);
            }}
            event={selectedEvent}
            onEdit={() => {
              setShowDetailsModal(false);
              setShowEventModal(true);
            }}
            onDelete={() => {
              fetchEvents();
              setShowDetailsModal(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && (
          <FilterPanel
            isOpen={showFilterPanel}
            onClose={() => setShowFilterPanel(false)}
            filters={filters}
            onFiltersChange={setFilters}
            events={events}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

