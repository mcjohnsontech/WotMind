'use client';

import { motion } from 'framer-motion';

interface StepIndicatorProps {
  steps: Array<{ label: string; description?: string }>;
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex justify-between mb-8">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <motion.div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              currentStep === i || (currentStep > i)
                ? 'bg-border-glow text-surface-0'
                : 'bg-surface-2 text-text-secondary'
            }`}
            animate={{
              scale: currentStep === i ? 1.1 : 0.95,
            }}
          >
            {i + 1}
          </motion.div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 ml-2 transition-colors ${
                currentStep > i ? 'bg-border-glow' : 'bg-surface-2'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
