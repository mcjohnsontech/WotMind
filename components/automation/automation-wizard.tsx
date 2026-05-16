'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { StepIndicator } from './step-indicator';

export interface AutomationFormData {
  automation_type?: string;
  name?: string;
  config?: Record<string, unknown>;
  ai_rules?: {
    auto_approve_below: number;
    require_approval_above: number;
    anomaly_score_threshold: number;
    max_amount: number;
    custom_rules?: Array<{
      field: string;
      operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
      value: number | string;
      action: 'block' | 'flag' | 'approve';
      label: string;
    }>;
  };
  notification_config?: {
    approval_phone: string;
    notify_on_complete: string;
    channels: string[];
    whatsapp_enabled: boolean;
  };
}

interface WizardStep {
  label: string;
  description: string;
  component: React.ComponentType<{
    data: AutomationFormData;
    onChange: (updates: Partial<AutomationFormData>) => void;
    onNext?: () => void;
    onBack?: () => void;
  }>;
}

interface AutomationWizardProps {
  steps: WizardStep[];
  onComplete: (data: AutomationFormData) => void | Promise<void>;
  onCancel?: () => void;
}

export function AutomationWizard({ steps, onComplete, onCancel }: AutomationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AutomationFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (updates: Partial<AutomationFormData>) => {
    setFormData({ ...formData, ...updates });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-surface-0 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Create Automation
          </h1>
          <p className="text-text-secondary">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
          </p>
        </div>

        {/* Progress */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  {steps[currentStep].label}
                </h2>
                <p className="text-text-secondary">
                  {steps[currentStep].description}
                </p>
              </div>

              <CurrentStepComponent
                data={formData}
                onChange={handleChange}
                onNext={handleNext}
                onBack={handleBack}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 justify-between mt-12">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
            >
              Back
            </Button>

            {isLastStep ? (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Automation'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
