'use client';

import { useEffect, useMemo, useState } from 'react';
import { Play, Loader2, AlertCircle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import type { StaffMember } from '@/types/payroll';

interface PayrollRunnerProps {
  automationId: string;
  staff: StaffMember[];
  onCompleted: () => void;
}

export function PayrollRunner({ automationId, staff, onCompleted }: PayrollRunnerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [running, setRunning] = useState(false);

  // Default: all staff selected, amounts = base_salary
  useEffect(() => {
    setSelected(new Set(staff.map((s) => s.id)));
    setAmounts(Object.fromEntries(staff.map((s) => [s.id, s.base_salary || 0])));
  }, [staff]);

  const total = useMemo(
    () => staff.filter((s) => selected.has(s.id)).reduce((sum, s) => sum + (amounts[s.id] || 0), 0),
    [staff, selected, amounts]
  );

  const toggleAll = () => {
    if (selected.size === staff.length) setSelected(new Set());
    else setSelected(new Set(staff.map((s) => s.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleRun = async () => {
    if (selected.size === 0) return toast.error('Select at least one staff member');
    if (total <= 0) return toast.error('Total must be greater than zero');
    if (!confirm(`Send ₦${total.toLocaleString()} to ${selected.size} staff? This will initiate real (sandbox) transfers.`)) return;

    setRunning(true);
    try {
      const staff_ids = Array.from(selected);
      const custom_amounts = Object.fromEntries(
        staff_ids.map((id) => [id, amounts[id] || 0])
      );

      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automation_id: automationId, staff_ids, custom_amounts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payroll failed');

      toast.success(
        `Payroll done: ${data.completed_count}/${staff_ids.length} paid · ₦${Number(data.total_amount).toLocaleString()}`
      );
      onCompleted();
    } catch (e: any) {
      toast.error(e.message || 'Payroll failed');
    } finally {
      setRunning(false);
    }
  };

  if (staff.length === 0) {
    return (
      <div className="bg-surface-1 border border-border rounded-xl py-10 text-center">
        <Wallet className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
        <p className="text-sm text-text-secondary mb-1">No staff added yet</p>
        <p className="text-[11px] text-text-tertiary">
          Add staff manually or import a CSV in the Staff tab first.
        </p>
      </div>
    );
  }

  const allSelected = selected.size === staff.length;

  return (
    <div className="space-y-4">
      <div className="bg-surface-1 border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface-2/40 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="w-4 h-4 accent-accent-primary cursor-pointer"
            />
            <span className="text-[12px] font-semibold text-text-primary">
              {selected.size} of {staff.length} selected
            </span>
          </label>
          <span className="text-[11px] text-text-tertiary">
            Edit any amount to override base salary
          </span>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-surface-2 sticky top-0">
              <tr>
                <th className="w-10"></th>
                <th className="text-left px-3 py-2 font-semibold text-text-tertiary uppercase tracking-wider text-[10px]">
                  Name
                </th>
                <th className="text-left px-3 py-2 font-semibold text-text-tertiary uppercase tracking-wider text-[10px]">
                  Account
                </th>
                <th className="text-left px-3 py-2 font-semibold text-text-tertiary uppercase tracking-wider text-[10px]">
                  Bank
                </th>
                <th className="text-right px-3 py-2 font-semibold text-text-tertiary uppercase tracking-wider text-[10px]">
                  Amount (₦)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {staff.map((s) => {
                const isSelected = selected.has(s.id);
                return (
                  <tr
                    key={s.id}
                    className={cn(
                      'transition-colors',
                      isSelected ? 'bg-surface-1' : 'bg-surface-1/50 opacity-60'
                    )}
                  >
                    <td className="pl-4 pr-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(s.id)}
                        className="w-4 h-4 accent-accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <p className="text-text-primary font-medium">{s.name}</p>
                      {s.department && (
                        <p className="text-[10px] text-text-tertiary">{s.department}</p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-text-secondary font-mono text-[11px]">
                      {s.account_number}
                    </td>
                    <td className="px-3 py-2 text-text-secondary text-[11px]">
                      {s.bank_name || s.bank_code}
                    </td>
                    <td className="px-1 py-1 text-right">
                      <input
                        type="number"
                        value={amounts[s.id] || 0}
                        onChange={(e) =>
                          setAmounts({ ...amounts, [s.id]: Number(e.target.value) || 0 })
                        }
                        disabled={!isSelected}
                        className="w-32 bg-surface-2 border border-border rounded-md px-2 py-1 text-right text-text-primary tabular-nums focus:outline-none focus:ring-1 focus:ring-accent-primary/50 disabled:opacity-40"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-border bg-surface-2/40 flex items-center justify-between">
          <div className="text-[12px] text-text-secondary">
            <span className="text-text-tertiary uppercase tracking-wider text-[10px] mr-2">
              Total
            </span>
            <span className="text-lg font-bold text-text-primary tabular-nums">
              ₦{total.toLocaleString()}
            </span>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleRun}
            disabled={selected.size === 0 || total <= 0}
            loading={running}
          >
            <Play className="w-3.5 h-3.5" />
            Run payroll
          </Button>
        </div>
      </div>

      <div className="bg-accent-amber/5 border border-accent-amber/20 rounded-lg p-3 flex items-start gap-2.5 text-[12px]">
        <AlertCircle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
        <div>
          <p className="text-text-primary font-medium mb-0.5">Sandbox mode</p>
          <p className="text-text-tertiary leading-relaxed">
            Transfers go through Squad's sandbox API. No real money moves. Switch to production keys in
            settings before going live.
          </p>
        </div>
      </div>
    </div>
  );
}
