import { useState } from 'react';
import { LoadingAnimation, FullPageLoader, InlineLoader } from '../components/Shared/LoadingAnimation';
import { motion } from 'framer-motion';

export function LoadingShowcase() {
  const [showFullPage, setShowFullPage] = useState(false);

  const variants: Array<{ name: string; variant: 'orbital' | 'pulse' | 'dots' | 'bars' | 'spin' | 'wave' }> = [
    { name: 'Orbital', variant: 'orbital' },
    { name: 'Pulse', variant: 'pulse' },
    { name: 'Dots', variant: 'dots' },
    { name: 'Bars', variant: 'bars' },
    { name: 'Spin', variant: 'spin' },
    { name: 'Wave', variant: 'wave' },
  ];

  const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Loading Animations Showcase
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Stylish and unique loading animations for ORBIT LIVE
          </p>
        </motion.div>

        {/* Animation Variants */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Animation Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {variants.map((item, index) => (
              <motion.div
                key={item.variant}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
                  {item.name}
                </h3>
                <div className="flex justify-center min-h-[120px] items-center">
                  <LoadingAnimation variant={item.variant} size="lg" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Size Variations */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Size Variations</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {sizes.map((size) => (
                <div key={size} className="text-center">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase">
                    {size}
                  </p>
                  <div className="flex justify-center min-h-[100px] items-center">
                    <LoadingAnimation variant="orbital" size={size} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* With Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">With Loading Text</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <LoadingAnimation variant="dots" size="md" text="Loading your data..." />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <LoadingAnimation variant="wave" size="md" text="Please wait..." />
            </div>
          </div>
        </motion.div>

        {/* Inline Loader */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Inline Loader (for buttons)</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">
                <InlineLoader />
                Loading...
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold">
                <InlineLoader />
                Saving...
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold">
                <InlineLoader />
                Processing...
              </button>
            </div>
          </div>
        </motion.div>

        {/* Full Page Loader Demo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Full Page Loader</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Click the button below to see the full-page loading experience
            </p>
            <button
              onClick={() => {
                setShowFullPage(true);
                setTimeout(() => setShowFullPage(false), 3000);
              }}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
            >
              Show Full Page Loader
            </button>
          </div>
        </motion.div>

        {/* Code Examples */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Usage Examples</h2>
          <div className="bg-gray-900 rounded-2xl p-6 shadow-lg overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`// Import the component
import { LoadingAnimation } from '../components/Shared/LoadingAnimation';

// Basic usage
<LoadingAnimation variant="orbital" size="md" />

// With text
<LoadingAnimation 
  variant="pulse" 
  size="lg" 
  text="Loading..." 
/>

// Full screen
<LoadingAnimation 
  variant="dots" 
  size="xl" 
  fullScreen={true} 
/>

// Full page loader
import { FullPageLoader } from '../components/Shared/LoadingAnimation';
<FullPageLoader message="Loading ORBIT LIVE..." />

// Inline loader for buttons
import { InlineLoader } from '../components/Shared/LoadingAnimation';
<button>
  <InlineLoader /> Loading...
</button>`}
            </pre>
          </div>
        </motion.div>
      </div>

      {/* Full Page Loader */}
      {showFullPage && <FullPageLoader message="Loading ORBIT LIVE..." />}
    </div>
  );
}

