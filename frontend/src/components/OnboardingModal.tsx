import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Memoir! 🎉',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Memoir is your AI-powered mental wellness companion. Let's take a quick tour of how it works.
          </p>
          <div className="text-6xl text-center">📝</div>
        </div>
      ),
    },
    {
      title: 'Journal Your Thoughts',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Use the <strong>Journal</strong> page to write about your day, thoughts, and feelings. Our AI will
            analyze your entries to help you understand your emotional patterns.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Tip:</strong> Try adding mood tags and emotions to get more personalized insights!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Explore Your Insights',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Visit the <strong>Insights</strong> page to see visualizations of your emotional journey, word clouds,
            and AI-generated insights about your patterns.
          </p>
        </div>
      ),
    },
    {
      title: 'Time Travel Reflections',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Use <strong>Time Travel</strong> to generate AI-powered summaries of your journal entries over any time
            period. Reflect on your growth and patterns.
          </p>
        </div>
      ),
    },
    {
      title: 'Track Your Habits',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Build healthy habits and track your streaks on the <strong>Habits</strong> page. Consistency is key to
            mental wellness!
          </p>
        </div>
      ),
    },
    {
      title: "You're All Set! 🚀",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Start your mental wellness journey by writing your first journal entry. Remember, progress takes time, and
            every entry matters.
          </p>
          <div className="text-6xl text-center">✨</div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    localStorage.setItem('memoir_onboarding_completed', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('memoir_onboarding_completed', 'true');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} title={steps[currentStep].title} size="md">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {steps[currentStep].content}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-blue-600'
                  : index < currentStep
                  ? 'w-2 bg-blue-300'
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              Previous
            </Button>
          )}
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

