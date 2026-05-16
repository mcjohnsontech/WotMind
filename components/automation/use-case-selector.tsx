'use client';

import { motion } from 'framer-motion';
import {
  Receipt,
  Users,
  FileText,
  Package,
  Image,
  Building2,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import type { AutomationType } from '@/types/automation';

interface UseCaseOption {
  type: AutomationType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const USE_CASES: UseCaseOption[] = [
  {
    type: 'receipt_reimbursement',
    title: 'Receipt Reimbursement',
    description: 'Upload receipts, auto-extract data, approve and pay',
    icon: Receipt,
    badge: 'Demo Ready',
  },
  {
    type: 'payroll',
    title: 'Payroll Management',
    description: 'Upload staff list, set rules, auto-pay salaries monthly',
    icon: Users,
    badge: 'Most Popular',
  },
  {
    type: 'expense',
    title: 'Expense Management',
    description: 'Staff submit expenses, AI reviews, manager approves',
    icon: FileText,
  },
  {
    type: 'invoice',
    title: 'Invoice & Bill Payment',
    description: 'Upload invoices, schedule auto-payment before due date',
    icon: FileText,
  },
  {
    type: 'inventory',
    title: 'Inventory Manager',
    description: 'Track stock levels, auto-alert when low, generate POs',
    icon: Package,
  },
  {
    type: 'batch_design',
    title: 'Batch Design Generation',
    description: 'Upload images and names, AI generates labeled designs',
    icon: Image,
  },
  {
    type: 'vendor_payment',
    title: 'Vendor Payment Tracker',
    description: 'Log vendor relationships, schedule settlements',
    icon: Building2,
  },
  {
    type: 'salary_advance',
    title: 'Salary Advance',
    description: 'Staff request advance, AI reviews, auto-deduct next salary',
    icon: CreditCard,
  },
];

interface UseCaseSelectorProps {
  selected?: AutomationType;
  onChange: (type: AutomationType) => void;
}

export function UseCaseSelector({ selected, onChange }: UseCaseSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {USE_CASES.map((useCase) => {
        const isSelected = selected === useCase.type;
        const IconComponent = useCase.icon;

        return (
          <motion.button
            key={useCase.type}
            onClick={() => onChange(useCase.type)}
            className={`relative p-6 rounded-lg border-2 transition-all text-left group ${
              isSelected
                ? 'border-border-glow bg-border-glow/10 ring-2 ring-border-glow/50'
                : 'border-border bg-surface-1 hover:border-border-glow/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {useCase.badge && (
              <div className="absolute top-3 right-3">
                <span className="text-xs font-semibold px-2 py-1 rounded bg-border-glow/20 text-border-glow">
                  {useCase.badge}
                </span>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg transition-all ${
                isSelected
                  ? 'bg-border-glow/20'
                  : 'bg-surface-2 group-hover:bg-border-glow/10'
              }`}>
                <IconComponent className={`w-6 h-6 ${
                  isSelected ? 'text-border-glow' : 'text-text-secondary'
                }`} />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">
                  {useCase.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {useCase.description}
                </p>
              </div>
            </div>

            {isSelected && (
              <motion.div
                className="absolute inset-0 border-2 border-border-glow rounded-lg pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
