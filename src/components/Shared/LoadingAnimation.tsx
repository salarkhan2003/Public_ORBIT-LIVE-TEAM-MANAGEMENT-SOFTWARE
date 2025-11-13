import { motion } from 'framer-motion';
import { Bot, Sparkles, Zap } from 'lucide-react';

type LoadingVariant = 'orbital' | 'pulse' | 'dots' | 'bars' | 'spin' | 'wave';

interface LoadingAnimationProps {
  variant?: LoadingVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

export function LoadingAnimation({
  variant = 'orbital',
  size = 'md',
  text = 'Loading...',
  fullScreen = false
}: LoadingAnimationProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg z-50'
    : 'flex items-center justify-center';

  const renderAnimation = () => {
    switch (variant) {
      case 'orbital':
        return <OrbitalLoader size={sizeClasses[size]} />;
      case 'pulse':
        return <PulseLoader size={sizeClasses[size]} />;
      case 'dots':
        return <DotsLoader size={size} />;
      case 'bars':
        return <BarsLoader size={size} />;
      case 'spin':
        return <SpinLoader size={sizeClasses[size]} />;
      case 'wave':
        return <WaveLoader size={size} />;
      default:
        return <OrbitalLoader size={sizeClasses[size]} />;
    }
  };

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {renderAnimation()}
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300"
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
}

// Orbital Loader - Planets orbiting around a sun
function OrbitalLoader({ size }: { size: string }) {
  return (
    <div className={`relative ${size}`}>
      {/* Center Sun */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg"
        animate={{
          scale: [1, 1.2, 1],
          boxShadow: [
            '0 0 20px rgba(251, 191, 36, 0.5)',
            '0 0 40px rgba(251, 191, 36, 0.8)',
            '0 0 20px rgba(251, 191, 36, 0.5)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Orbiting Planets */}
      {[0, 120, 240].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-full h-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
            delay: delay / 360
          }}
        >
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${
              i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-purple-500' : 'bg-pink-500'
            } shadow-lg`}
          />
        </motion.div>
      ))}

      {/* Orbit Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-full opacity-20" />
    </div>
  );
}

// Pulse Loader - Expanding and contracting circles
function PulseLoader({ size }: { size: string }) {
  return (
    <div className={`relative ${size}`}>
      {[0, 0.3, 0.6].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600"
          animate={{
            scale: [0, 1.5],
            opacity: [0.8, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay,
            ease: 'easeOut'
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <Bot className="w-1/2 h-1/2 text-indigo-600 dark:text-indigo-400" />
      </div>
    </div>
  );
}

// Dots Loader - Bouncing dots
function DotsLoader({ size }: { size: 'sm' | 'md' | 'lg' | 'xl' }) {
  const dotSize = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };

  return (
    <div className="flex gap-2">
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.div
          key={i}
          className={`${dotSize[size]} rounded-full bg-gradient-to-br ${
            i === 0 ? 'from-blue-500 to-cyan-500' : 
            i === 1 ? 'from-purple-500 to-pink-500' : 
            'from-orange-500 to-red-500'
          } shadow-lg`}
          animate={{
            y: [-10, 10, -10],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

// Bars Loader - Equalizer-style bars
function BarsLoader({ size }: { size: 'sm' | 'md' | 'lg' | 'xl' }) {
  const heights = {
    sm: ['h-4', 'h-6', 'h-8', 'h-6', 'h-4'],
    md: ['h-6', 'h-10', 'h-14', 'h-10', 'h-6'],
    lg: ['h-8', 'h-14', 'h-20', 'h-14', 'h-8'],
    xl: ['h-10', 'h-16', 'h-24', 'h-16', 'h-10']
  };

  const widths = {
    sm: 'w-1',
    md: 'w-1.5',
    lg: 'w-2',
    xl: 'w-3'
  };

  return (
    <div className="flex items-end gap-1">
      {heights[size].map((maxH, i) => (
        <motion.div
          key={i}
          className={`${widths[size]} ${maxH} rounded-full bg-gradient-to-t from-indigo-600 to-purple-600`}
          animate={{
            scaleY: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

// Spin Loader - Rotating gradient ring
function SpinLoader({ size }: { size: string }) {
  return (
    <div className={`relative ${size}`}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #6366f1 270deg, #8b5cf6 360deg)',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-900" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Zap className="w-1/3 h-1/3 text-indigo-600 dark:text-indigo-400" />
      </div>
    </div>
  );
}

// Wave Loader - Flowing wave animation
function WaveLoader({ size }: { size: 'sm' | 'md' | 'lg' | 'xl' }) {
  const dotCount = 8;
  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  return (
    <div className="flex gap-1">
      {Array.from({ length: dotCount }).map((_, i) => (
        <motion.div
          key={i}
          className={`${dotSize[size]} rounded-full bg-gradient-to-br from-cyan-500 to-blue-600`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

// Full page loading component with brand
export function FullPageLoader({ message = 'Loading ORBIT LIVE...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 z-50">
      <div className="text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mb-8 inline-block"
        >
          <div className="relative w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Bot className="w-12 h-12 text-indigo-600" />
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-black text-white mb-4"
        >
          {message}
        </motion.h2>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-white rounded-full"
            animate={{
              x: [-256, 256]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{ width: '50%' }}
          />
        </div>

        {/* Animated Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex justify-center gap-2"
        >
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Mini inline loader for buttons
export function InlineLoader({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  );
}

