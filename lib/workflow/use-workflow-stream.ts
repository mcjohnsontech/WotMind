'use client';

import { useCallback, useRef, useState } from 'react';
import type { Node, Edge } from '@xyflow/react';

export interface StreamHandlers {
  onName?: (name: string) => void;
  onNode?: (node: Node) => void;
  onEdge?: (edge: Edge) => void;
  onComplete?: (payload: { name: string; explanation: string; nodes: Node[]; edges: Edge[] }) => void;
  onError?: (message: string) => void;
  onStatus?: (status: string) => void;
}

export interface StartOptions {
  prompt: string;
  existingNodes?: Node[];
  existingEdges?: Edge[];
}

export function useWorkflowStream(handlers: StreamHandlers) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [nodeCount, setNodeCount] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setIsStreaming(false);
  }, []);

  const start = useCallback(async (opts: StartOptions) => {
    if (isStreaming) cancel();

    const controller = new AbortController();
    controllerRef.current = controller;
    setIsStreaming(true);
    setStatus('Connecting…');
    setNodeCount(0);

    try {
      const res = await fetch('/api/ai/generate-workflow/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: opts.prompt,
          existing_nodes: opts.existingNodes || [],
          existing_edges: opts.existingEdges || [],
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Stream failed: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let eventEnd: number;
        while ((eventEnd = buffer.indexOf('\n\n')) !== -1) {
          const raw = buffer.slice(0, eventEnd);
          buffer = buffer.slice(eventEnd + 2);

          let eventType = 'message';
          let dataStr = '';
          for (const line of raw.split('\n')) {
            if (line.startsWith('event:')) eventType = line.slice(6).trim();
            else if (line.startsWith('data:')) dataStr += line.slice(5).trim();
          }
          if (!dataStr) continue;

          let data: any;
          try {
            data = JSON.parse(dataStr);
          } catch {
            continue;
          }

          switch (eventType) {
            case 'status':
              setStatus(data.message || data.stage || '');
              handlersRef.current.onStatus?.(data.message || data.stage || '');
              break;
            case 'name':
              if (data.name) handlersRef.current.onName?.(data.name);
              break;
            case 'node':
              if (data.node) {
                receivedCount++;
                setNodeCount(receivedCount);
                setStatus(`Adding node: ${data.node.data?.label || data.node.type}`);
                handlersRef.current.onNode?.(data.node);
              }
              break;
            case 'edge':
              if (data.edge) handlersRef.current.onEdge?.(data.edge);
              break;
            case 'complete':
              setStatus('Workflow ready');
              handlersRef.current.onComplete?.(data);
              break;
            case 'error':
              handlersRef.current.onError?.(data.message || 'Stream error');
              break;
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        handlersRef.current.onError?.(err.message || 'Stream failed');
      }
    } finally {
      setIsStreaming(false);
      controllerRef.current = null;
    }
  }, [cancel, isStreaming]);

  return { start, cancel, isStreaming, status, nodeCount };
}
