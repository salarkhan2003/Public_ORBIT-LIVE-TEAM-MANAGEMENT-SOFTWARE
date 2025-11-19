import React, { useState } from 'react';
import { X, ChevronRight, Sparkles, Users, FolderKanban, Calendar, BarChart3, Bot, FileText, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  section: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ORBIT LIVE TEAM! 🎉',
    description: 'Your AI-powered workspace for seamless team collaboration. Let\'s take a quick tour of the key features.',
    icon: Sparkles,
    section: 'Overview'
  },
  {
    id: 'dashboard',
    title: 'Dashboard - Your Command Center',
    description: 'Get a real-time overview of your projects, tasks, and team activity. Track progress, view analytics, and stay on top of everything.',
    icon: BarChart3,
    section: 'Navigation'
  },
  {
    id: 'projects',
    title: 'Projects - Organize Your Work',
    description: 'Create and manage projects with ease. Track milestones, assign tasks, and collaborate with your team in one place.',
    icon: FolderKanban,
    section: 'Work Management'
  },
  {
    id: 'tasks',
    title: 'Tasks - Stay Productive',
    description: 'Create, assign, and track tasks. Set priorities, due dates, and get notifications when tasks are updated.',
    icon: FileText,
    section: 'Task Management'
  },
  {
    id: 'team',
    title: 'Team - Collaborate Together',
    description: 'Manage your team members, assign roles, and collaborate in real-time. See who\'s working on what.',
    icon: Users,
    section: 'Collaboration'
  },
  {
    id: 'calendar',
    title: 'Calendar - Plan Ahead',
    description: 'Schedule meetings, set deadlines, and view your team\'s availability. Never miss an important event.',
    icon: Calendar,
    section: 'Scheduling'
  },
  {
    id: 'ai',
    title: 'AI Assistant - Your Smart Helper',
    description: 'Get AI-powered insights, automate workflows, and get intelligent recommendations to boost productivity.',
    icon: Bot,
    section: 'AI Features'
  },
  {
    id: 'notifications',
    title: 'Notifications - Stay Updated',
    description: 'Get real-time notifications for tasks, mentions, and important updates. Never miss what matters.',
    icon: Bell,
    section: 'Communication'
  }
];

interface WorkspaceTourProps {
  onComplete: () => void;
}

export function WorkspaceTour({ onComplete }: WorkspaceTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    // Mark tour as completed in localStorage
    localStorage.setItem('workspaceTourCompleted', 'true');
    onComplete();
  };

  const handleSkip = () => {
    handleClose();
  };

  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              aria-label="Close tour"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <step.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{step.title}</h2>
                <p className="text-white/90 text-sm">{step.section}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-white/80 text-xs mb-2">
                <span>Step {currentStep + 1} of {tourSteps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[200px] flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <step.icon className="w-10 h-10 text-white" />
              </div>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {step.description}
              </p>
            </motion.div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              {tourSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-blue-600 w-8'
                      : index < currentStep
                      ? 'bg-blue-400'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isFirstStep
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Previous
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
                >
                  Skip Tour
                </button>
                
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <span>{isLastStep ? 'Get Started' : 'Next'}</span>
                  {!isLastStep && <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

