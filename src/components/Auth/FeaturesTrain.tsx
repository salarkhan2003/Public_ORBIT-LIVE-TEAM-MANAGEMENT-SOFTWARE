import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Users,
  BarChart3,
  Clock,
  Shield,
  Sparkles,
  Bot,
  Rocket,
  Target,
  TrendingUp,
  Award,
  Globe
} from 'lucide-react';

const features = [
  { icon: Zap, text: 'AI-Powered Insights', gradient: 'from-yellow-500 to-orange-500' },
  { icon: Users, text: 'Real-Time Collaboration', gradient: 'from-blue-500 to-cyan-500' },
  { icon: BarChart3, text: 'Advanced Analytics', gradient: 'from-purple-500 to-pink-500' },
  { icon: Clock, text: 'Smart Time Tracking', gradient: 'from-green-500 to-emerald-500' },
  { icon: Shield, text: 'Enterprise Security', gradient: 'from-red-500 to-rose-500' },
  { icon: Sparkles, text: 'Intuitive Interface', gradient: 'from-indigo-500 to-violet-500' },
  { icon: Bot, text: 'AI Assistant 24/7', gradient: 'from-cyan-500 to-blue-500' },
  { icon: Rocket, text: 'Lightning Fast', gradient: 'from-orange-500 to-red-500' },
  { icon: Target, text: 'Goal Tracking', gradient: 'from-pink-500 to-purple-500' },
  { icon: TrendingUp, text: 'Productivity Boost', gradient: 'from-emerald-500 to-green-500' },
  { icon: Award, text: 'Team Recognition', gradient: 'from-violet-500 to-purple-500' },
  { icon: Globe, text: 'Global Teams', gradient: 'from-blue-500 to-indigo-500' },
];

export function FeaturesTrain() {
  // Duplicate features for seamless infinite scroll
  const duplicatedFeatures = [...features, ...features];

  return (
    <div className="relative w-full overflow-hidden py-8">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-900 via-gray-900/80 to-transparent z-10 pointer-events-none" />

      {/* Moving features container */}
      <div className="flex space-x-4">
        <motion.div
          className="flex space-x-4"
          animate={{
            x: [0, -1920], // Adjust based on total width
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {duplicatedFeatures.map((feature, index) => (
            <div
              key={`${feature.text}-${index}`}
              className="flex-shrink-0 group"
            >
              <div className="flex items-center space-x-3 px-6 py-3 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-full hover:border-gray-600/80 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className={`w-8 h-8 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-200 whitespace-nowrap pr-2">
                  {feature.text}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom subtle glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
    </div>
  );
}

