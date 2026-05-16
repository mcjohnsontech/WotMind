
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { type AuditEvent } from '@/types/audit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/lib/utils/format';

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      const response = await fetch('/api/audit?limit=100');
      const data = await response.json();
      setEvents(data.events || []);
      setIsLoading(false);
    };

    fetchEvents();

    // Subscribe to realtime updates (only if in browser)
    if (typeof window !== 'undefined') {
      try {
        const supabase = getSupabaseClient();
        const channel = supabase
          .channel('audit_events')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'audit_events',
            },
            (payload: any) => {
              setEvents((prev) => [payload.new as AuditEvent, ...prev]);
            }
          )
          .subscribe();

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error('Failed to subscribe to realtime:', error);
      }
    }
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-text-primary">Audit Log</h1>
        <p className="text-text-secondary">
          Real-time event stream of all system actions and decisions
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-text-secondary">Loading audit events...</p>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-text-secondary text-center py-8">
              No audit events yet. Run the demo to generate events.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:border-border-glow/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-text-primary">
                        {event.event_type}
                      </h3>
                      <Badge
                        variant={
                          event.severity === 'critical'
                            ? 'error'
                            : event.severity === 'error'
                              ? 'error'
                              : event.severity === 'warn'
                                ? 'warning'
                                : 'info'
                        }
                      >
                        {event.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {event.entity_type && `${event.entity_type}: `}
                      {JSON.stringify(event.metadata).slice(0, 80)}...
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary whitespace-nowrap">
                    {formatTimeAgo(event.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
