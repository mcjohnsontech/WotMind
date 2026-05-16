'use client';

export const dynamic = 'force-dynamic';

import { ModelPicker } from '@/components/settings/model-picker';

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1100px] mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Settings
        </h1>
        <p className="text-[13px] sm:text-sm text-text-secondary mt-1">
          Choose which AI model powers your automations and control your monthly usage.
        </p>
      </div>

      <section>
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-text-tertiary mb-3">
          AI Model
        </h2>
        <ModelPicker />
      </section>
    </div>
  );
}
