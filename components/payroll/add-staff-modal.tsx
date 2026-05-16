'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NIGERIAN_BANKS } from '@/lib/nigerian-banks';

interface StaffForm {
  name: string;
  email: string;
  phone_number: string;
  account_number: string;
  bank_code: string;
  base_salary: number;
  department: string;
  payment_type: 'monthly' | 'weekly' | 'daily' | 'per_task';
}

const EMPTY_FORM: StaffForm = {
  name: '',
  email: '',
  phone_number: '',
  account_number: '',
  bank_code: '',
  base_salary: 0,
  department: '',
  payment_type: 'monthly',
};

interface AddStaffModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Pass a staff object to edit; omit to add new */
  initial?: Partial<StaffForm> & { id?: string };
}

export function AddStaffModal({ open, onClose, onSaved, initial }: AddStaffModalProps) {
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY_FORM,
        ...initial,
        base_salary: Number(initial?.base_salary) || 0,
      } as StaffForm);
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.account_number.match(/^\d{10}$/)) return toast.error('Account number must be 10 digits');
    if (!form.bank_code) return toast.error('Pick a bank');
    if (!form.base_salary || form.base_salary <= 0) return toast.error('Enter a base salary');

    const bank_name = NIGERIAN_BANKS.find((b) => b.code === form.bank_code)?.name;

    setSaving(true);
    try {
      const res = await fetch('/api/payroll/staff', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit ? { id: initial!.id } : {}),
          ...form,
          bank_name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      toast.success(isEdit ? 'Staff updated' : 'Staff added');
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-1 border border-border rounded-2xl shadow-2xl w-full max-w-lg my-8 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-text-primary">
            {isEdit ? 'Edit staff member' : 'Add staff member'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface-2 text-text-tertiary hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Field label="Full name *">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Adaeze Okonkwo"
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Phone">
              <Input
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="+2348012345678"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="adaeze@company.ng"
              />
            </Field>
          </div>

          <Field label="Bank *">
            <select
              value={form.bank_code}
              onChange={(e) => setForm({ ...form, bank_code: e.target.value })}
              className="flex h-10 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
            >
              <option value="">Select bank…</option>
              {NIGERIAN_BANKS.map((b) => (
                <option key={`${b.code}-${b.name}`} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Account number * (10 digits)">
            <Input
              value={form.account_number}
              onChange={(e) =>
                setForm({ ...form, account_number: e.target.value.replace(/\D/g, '').slice(0, 10) })
              }
              placeholder="0123456789"
              inputMode="numeric"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Base salary (₦) *">
              <Input
                type="number"
                min="0"
                value={form.base_salary || ''}
                onChange={(e) => setForm({ ...form, base_salary: Number(e.target.value) || 0 })}
                placeholder="150000"
              />
            </Field>
            <Field label="Pay frequency">
              <select
                value={form.payment_type}
                onChange={(e) =>
                  setForm({ ...form, payment_type: e.target.value as StaffForm['payment_type'] })
                }
                className="flex h-10 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
                <option value="per_task">Per task</option>
              </select>
            </Field>
          </div>

          <Field label="Department">
            <Input
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Engineering"
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-surface-2/30 rounded-b-2xl">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Save changes' : 'Add staff'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-widest block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
