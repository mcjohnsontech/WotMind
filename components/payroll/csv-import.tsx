'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, Check, AlertCircle, X, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { NIGERIAN_BANKS, bankNameByCode } from '@/lib/nigerian-banks';

interface ParsedRow {
  name: string;
  email?: string;
  phone_number?: string;
  account_number: string;
  bank_code: string;
  bank_name?: string;
  base_salary: number;
  department?: string;
  payment_type?: string;
  __errors: string[];
}

interface CsvImportProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

const REQUIRED_COLUMNS = ['name', 'account_number', 'bank_code', 'base_salary'];

function buildTemplateCsv(): string {
  const header = [
    'name',
    'email',
    'phone_number',
    'account_number',
    'bank_code',
    'base_salary',
    'department',
    'payment_type',
  ];
  const sample = [
    ['Adaeze Okonkwo', 'adaeze@example.ng', '+2348012345678', '0123456789', '058', '250000', 'Pharmacy', 'monthly'],
    ['Tunde Bello', 'tunde@example.ng', '+2348098765432', '9876543210', '044', '180000', 'Sales', 'monthly'],
  ];
  return [header, ...sample].map((r) => r.join(',')).join('\n');
}

export function CsvImport({ open, onClose, onImported }: CsvImportProps) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const reset = () => {
    setRows([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (result) => {
        const headers = result.meta.fields || [];
        const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
        if (missing.length) {
          toast.error(`Missing required columns: ${missing.join(', ')}`);
          reset();
          return;
        }

        const parsed: ParsedRow[] = result.data.map((raw) => {
          const errors: string[] = [];
          const accountNumber = String(raw.account_number || '').replace(/\D/g, '');
          const bankCode = String(raw.bank_code || '').trim();
          const baseSalary = Number(raw.base_salary) || 0;

          if (!raw.name?.trim()) errors.push('Missing name');
          if (!accountNumber.match(/^\d{10}$/)) errors.push('Account number must be 10 digits');
          if (!bankCode) errors.push('Missing bank_code');
          else if (!NIGERIAN_BANKS.some((b) => b.code === bankCode)) errors.push('Unknown bank_code');
          if (baseSalary <= 0) errors.push('Invalid base_salary');

          return {
            name: raw.name?.trim() || '',
            email: raw.email?.trim() || undefined,
            phone_number: raw.phone_number?.trim() || undefined,
            account_number: accountNumber,
            bank_code: bankCode,
            bank_name: bankNameByCode(bankCode),
            base_salary: baseSalary,
            department: raw.department?.trim() || undefined,
            payment_type: raw.payment_type?.trim() || 'monthly',
            __errors: errors,
          };
        });

        setRows(parsed);
      },
      error: (err) => {
        toast.error(`Parse error: ${err.message}`);
        reset();
      },
    });
  };

  const downloadTemplate = () => {
    const blob = new Blob([buildTemplateCsv()], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wotmind-staff-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const validRows = rows.filter((r) => r.__errors.length === 0);
  const invalidCount = rows.length - validRows.length;

  const handleImport = async () => {
    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }
    setImporting(true);
    try {
      const res = await fetch('/api/payroll/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulk: true,
          items: validRows.map((r) => {
            const { __errors, ...rest } = r;
            return rest;
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      toast.success(`Imported ${validRows.length} staff`);
      onImported();
      reset();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-1 border border-border rounded-2xl shadow-2xl w-full max-w-3xl my-8 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-text-primary">Import staff from CSV</h3>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="p-1.5 rounded-md hover:bg-surface-2 text-text-tertiary hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {rows.length === 0 ? (
            <>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent-primary/40 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                <Upload className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
                <p className="text-sm font-medium text-text-primary mb-1">
                  Drop a CSV file here, or
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose file
                </Button>
                <p className="text-[11px] text-text-tertiary mt-3">
                  Excel users: export your sheet as CSV first (File → Save As → CSV).
                </p>
              </div>

              <div className="bg-surface-2/40 border border-border-subtle rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-text-primary mb-1">
                      Required CSV columns
                    </p>
                    <p className="text-[12px] text-text-secondary">
                      <code className="text-accent-primary">name</code>,{' '}
                      <code className="text-accent-primary">account_number</code>,{' '}
                      <code className="text-accent-primary">bank_code</code>,{' '}
                      <code className="text-accent-primary">base_salary</code>
                      <br />
                      Optional: email, phone_number, department, payment_type
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                    <Download className="w-3.5 h-3.5" />
                    Template
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px]">
                  <FileText className="w-4 h-4 text-text-tertiary" />
                  <span className="text-text-primary font-medium">{fileName}</span>
                  <span className="text-text-tertiary">·</span>
                  <span className="text-accent-green">
                    {validRows.length} valid
                  </span>
                  {invalidCount > 0 && (
                    <>
                      <span className="text-text-tertiary">·</span>
                      <span className="text-accent-red">{invalidCount} with errors</span>
                    </>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Choose different file
                </Button>
              </div>

              <div className="border border-border rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
                <table className="w-full text-[12px]">
                  <thead className="bg-surface-2 sticky top-0">
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
                        Salary
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-text-tertiary uppercase tracking-wider text-[10px]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {rows.map((r, i) => (
                      <tr
                        key={i}
                        className={cn(
                          r.__errors.length > 0 && 'bg-accent-red/5'
                        )}
                      >
                        <td className="px-3 py-2 text-text-primary">{r.name || '—'}</td>
                        <td className="px-3 py-2 text-text-secondary font-mono text-[11px]">
                          {r.account_number || '—'}
                        </td>
                        <td className="px-3 py-2 text-text-secondary">
                          {r.bank_name || r.bank_code || '—'}
                        </td>
                        <td className="px-3 py-2 text-right text-text-primary tabular-nums">
                          ₦{r.base_salary.toLocaleString()}
                        </td>
                        <td className="px-3 py-2">
                          {r.__errors.length === 0 ? (
                            <span className="inline-flex items-center gap-1 text-accent-green text-[11px]">
                              <Check className="w-3 h-3" /> OK
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-accent-red text-[11px]"
                              title={r.__errors.join('; ')}
                            >
                              <AlertCircle className="w-3 h-3" />
                              {r.__errors[0]}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-surface-2/30 rounded-b-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleImport}
            disabled={validRows.length === 0 || importing}
            loading={importing}
          >
            Import {validRows.length > 0 ? `${validRows.length} staff` : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
