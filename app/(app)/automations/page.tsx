'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Zap,
  Activity,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ScanText,
  Users,
  Receipt,
  Package,
  FileText,
  Palette,
  Wallet,
  Sparkles,
} from 'lucide-react';
import type { Automation } from '@/types/automation';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  receipt_reimbursement: <ScanText className="w-4 h-4 text-node-ocr" />,
  payroll: <Users className="w-4 h-4 text-node-transfer" />,
  expense: <Receipt className="w-4 h-4 text-accent-amber" />,
  invoice: <FileText className="w-4 h-4 text-accent-blue" />,
  inventory: <Package className="w-4 h-4 text-accent-purple" />,
  batch_design: <Palette className="w-4 h-4 text-node-condition" />,
  vendor_payment: <Wallet className="w-4 h-4 text-node-transfer" />,
  salary_advance: <Users className="w-4 h-4 text-accent-amber" />,
};

const TYPE_BG: Record<string, string> = {
  receipt_reimbursement: 'bg-node-ocr/10',
  payroll: 'bg-node-transfer/10',
  expense: 'bg-accent-amber-muted',
  invoice: 'bg-accent-blue-muted',
  inventory: 'bg-accent-purple-muted',
  batch_design: 'bg-node-condition/10',
  vendor_payment: 'bg-node-transfer/10',
  salary_advance: 'bg-accent-amber-muted',
};

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fetchAutomations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/automations');
        const data = await response.json();
        setAutomations(data.automations || []);
      } catch (error) {
        console.error('Failed to fetch automations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAutomations();
  }, []);

  const stats = [
    {
      label: 'Total',
      value: automations.length,
      icon: <Zap className="w-4 h-4" />,
      color: 'text-accent-primary',
    },
    {
      label: 'Active',
      value: automations.filter((a) => a.status === 'active').length,
      icon: <Activity className="w-4 h-4" />,
      color: 'text-accent-green',
    },
    {
      label: 'Paused',
      value: automations.filter((a) => a.status === 'paused').length,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-accent-amber',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Automations
          </h1>
          <p className="text-sm text-text-secondary">
            Manage your intelligent business automation rules
          </p>
        </div>
        <Link href="/automations/new">
          <Button variant="primary" size="sm">
            <Plus className="w-3.5 h-3.5" />
            New Automation
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="!p-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[12px] text-text-tertiary font-medium uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-text-primary">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-9 h-9 rounded-xl bg-surface-2 flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-surface-1 border border-border animate-pulse"
            />
          ))}
        </div>
      ) : automations.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-text-tertiary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              No automations yet
            </h3>
            <p className="text-sm text-text-secondary mb-5 max-w-sm mx-auto">
              Create your first automation to start processing transactions automatically
            </p>
            <Link href="/automations/new">
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5" />
                Create Automation
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((automation, idx) => (
            <Link key={automation.id} href={`/automations/${automation.id}`}>
              <Card
                className="h-full hover:border-accent-primary/20 cursor-pointer group"
                style={{
                  animation: `fade-in-up 0.3s ease ${idx * 0.05}s both`,
                }}
              >
                <CardContent className="space-y-3 !p-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TYPE_BG[automation.automation_type] || 'bg-surface-3'}`}>
                        {TYPE_ICONS[automation.automation_type] || (
                          <Zap className="w-4 h-4 text-accent-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-[14px] font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                          {automation.name}
                        </h3>
                        <p className="text-[12px] text-text-tertiary capitalize">
                          {automation.automation_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        automation.status === 'active'
                          ? 'success'
                          : automation.status === 'paused'
                            ? 'warning'
                            : 'default'
                      }
                      size="sm"
                      dot
                    >
                      {automation.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                    <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(automation.created_at).toLocaleDateString()}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-text-tertiary group-hover:text-accent-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
