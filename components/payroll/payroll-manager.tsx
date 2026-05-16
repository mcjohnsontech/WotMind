'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Upload, Trash2, Pencil, Users, Play, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { AddStaffModal } from './add-staff-modal';
import { CsvImport } from './csv-import';
import { PayrollRunner } from './payroll-runner';
import type { StaffMember } from '@/types/payroll';

type Tab = 'staff' | 'run';

export function PayrollManager({ automationId }: { automationId: string }) {
  const [tab, setTab] = useState<Tab>('staff');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/payroll/staff');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Load failed');
      setStaff(data.staff || []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from staff?`)) return;
    try {
      const res = await fetch('/api/payroll/staff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Removed');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Delete failed');
    }
  };

  return (
    <div className="bg-surface-1 border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-accent-primary" />
          <h2 className="text-[14px] font-semibold text-text-primary">Payroll</h2>
          <span className="text-[11px] text-text-tertiary">({staff.length} staff)</span>
        </div>

        <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-1">
          <TabButton active={tab === 'staff'} onClick={() => setTab('staff')}>
            Staff list
          </TabButton>
          <TabButton active={tab === 'run'} onClick={() => setTab('run')}>
            <Play className="w-3 h-3" />
            Run payroll
          </TabButton>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-text-tertiary">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : tab === 'staff' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px] text-text-tertiary">
                Add staff manually or import a CSV. Bank details power Squad transfers when you run payroll.
              </p>
              <div className="flex gap-2 shrink-0">
                <Button variant="secondary" size="sm" onClick={() => setCsvOpen(true)}>
                  <Upload className="w-3.5 h-3.5" />
                  Import CSV
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setAddOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add staff
                </Button>
              </div>
            </div>

            {staff.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl py-12 text-center">
                <Users className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
                <p className="text-sm text-text-primary font-medium mb-1">No staff yet</p>
                <p className="text-[12px] text-text-tertiary">
                  Add your first staff member to start running payroll.
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead className="bg-surface-2">
                    <tr>
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
                        Base salary
                      </th>
                      <th className="w-24"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {staff.map((s) => (
                      <tr key={s.id} className="hover:bg-surface-2/40 transition-colors group">
                        <td className="px-3 py-2.5">
                          <p className="text-text-primary font-medium">{s.name}</p>
                          <p className="text-[10px] text-text-tertiary">
                            {s.department || s.email || s.phone_number || '—'}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-text-secondary font-mono text-[11px]">
                          {s.account_number}
                        </td>
                        <td className="px-3 py-2.5 text-text-secondary text-[12px]">
                          {s.bank_name || s.bank_code}
                        </td>
                        <td className="px-3 py-2.5 text-right text-text-primary tabular-nums">
                          ₦{(s.base_salary || 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditing(s);
                                setAddOpen(true);
                              }}
                              className="p-1.5 rounded-md hover:bg-surface-3 text-text-tertiary hover:text-text-primary"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s.id, s.name)}
                              className="p-1.5 rounded-md hover:bg-accent-red/10 text-text-tertiary hover:text-accent-red"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <PayrollRunner
            automationId={automationId}
            staff={staff}
            onCompleted={() => {
              setTab('staff');
              load();
            }}
          />
        )}
      </div>

      <AddStaffModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={load}
        initial={editing || undefined}
      />
      <CsvImport open={csvOpen} onClose={() => setCsvOpen(false)} onImported={load} />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all',
        active
          ? 'bg-surface-1 text-text-primary shadow-sm'
          : 'text-text-tertiary hover:text-text-secondary'
      )}
    >
      {children}
    </button>
  );
}
