import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are WotMind's AI workflow architect for Nigerian businesses.

You convert plain-English business descriptions into precise workflow JSON.

Available node types (use EXACT type strings):
- "trigger" — Workflow start (manual, upload, etc.)
- "webhook" — HTTP webhook trigger
- "schedule" — Cron schedule trigger
- "ocr" — Gemini Vision OCR for receipts/invoices/IDs
- "trust" — Trust verification (duplicate, vendor, anomaly)
- "ai" — Multi-check AI risk assessment with pattern learning
- "condition" — Branch on previous node output (field/operator/value)
- "filter" — Stop workflow unless an expression evaluates true
- "transfer" — Squad API bank transfer (NGN)
- "notification" — Send SMS/WhatsApp/email
- "audit" — Append to immutable audit trail
- "database" — Read/write Supabase table

Rules:
1. EXACTLY ONE trigger-type node, placed first. Pick "webhook" or "schedule" only if the user explicitly asks; otherwise use "trigger".
2. Layout: linear flow at y=240, x starts 120, step +320. Branches offset y by ±160.
3. Generate stable IDs: "{type}-{index}" (e.g. "ocr-1", "trust-1").
4. Always include a "label" and a one-sentence "description" in node.data.
5. Edges must reference real node ids and use animated:true.
6. Output STRICT JSON only — no markdown fences, no commentary.

Output schema:
{
  "name": "Workflow name (3–6 words)",
  "explanation": "One sentence describing what this workflow does end-to-end",
  "nodes": [
    {
      "id": "trigger-1",
      "type": "trigger",
      "position": { "x": 120, "y": 240 },
      "data": { "label": "Manual Trigger", "description": "Starts when a user uploads a receipt" }
    }
  ],
  "edges": [
    { "id": "e1", "source": "trigger-1", "target": "ocr-1", "animated": true }
  ]
}`;

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

function extractJson(text: string): any | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function tryParsePartialNodes(buffer: string): { nodes: any[]; edges: any[] } {
  const nodes: any[] = [];
  const edges: any[] = [];

  const nodesStart = buffer.indexOf('"nodes"');
  if (nodesStart !== -1) {
    const arrStart = buffer.indexOf('[', nodesStart);
    if (arrStart !== -1) {
      let depth = 0;
      let inString = false;
      let escape = false;
      let objStart = -1;
      for (let i = arrStart; i < buffer.length; i++) {
        const ch = buffer[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (ch === '\\') {
          escape = true;
          continue;
        }
        if (ch === '"') {
          inString = !inString;
          continue;
        }
        if (inString) continue;
        if (ch === '{') {
          if (depth === 0) objStart = i;
          depth++;
        } else if (ch === '}') {
          depth--;
          if (depth === 0 && objStart !== -1) {
            const slice = buffer.slice(objStart, i + 1);
            try {
              nodes.push(JSON.parse(slice));
            } catch {
              /* incomplete */
            }
            objStart = -1;
          }
        } else if (ch === ']' && depth === 0) {
          break;
        }
      }
    }
  }

  const edgesStart = buffer.indexOf('"edges"');
  if (edgesStart !== -1) {
    const arrStart = buffer.indexOf('[', edgesStart);
    if (arrStart !== -1) {
      let depth = 0;
      let inString = false;
      let escape = false;
      let objStart = -1;
      for (let i = arrStart; i < buffer.length; i++) {
        const ch = buffer[i];
        if (escape) {
          escape = false;
          continue;
        }
        if (ch === '\\') {
          escape = true;
          continue;
        }
        if (ch === '"') {
          inString = !inString;
          continue;
        }
        if (inString) continue;
        if (ch === '{') {
          if (depth === 0) objStart = i;
          depth++;
        } else if (ch === '}') {
          depth--;
          if (depth === 0 && objStart !== -1) {
            const slice = buffer.slice(objStart, i + 1);
            try {
              edges.push(JSON.parse(slice));
            } catch {
              /* incomplete */
            }
            objStart = -1;
          }
        } else if (ch === ']' && depth === 0) {
          break;
        }
      }
    }
  }

  return { nodes, edges };
}

function extractStringField(buffer: string, field: string): string | null {
  const idx = buffer.indexOf(`"${field}"`);
  if (idx === -1) return null;
  const colon = buffer.indexOf(':', idx);
  if (colon === -1) return null;
  const quote = buffer.indexOf('"', colon);
  if (quote === -1) return null;
  let end = quote + 1;
  while (end < buffer.length) {
    if (buffer[end] === '\\') {
      end += 2;
      continue;
    }
    if (buffer[end] === '"') break;
    end++;
  }
  if (end >= buffer.length) return null;
  return buffer.slice(quote + 1, end);
}

export async function POST(request: NextRequest) {
  const { prompt, existing_nodes } = await request.json().catch(() => ({}));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const push = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sse(event, data)));
      };

      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        push('error', { message: 'Prompt is required' });
        controller.close();
        return;
      }

      try {
        push('status', { stage: 'thinking', message: 'Designing your workflow…' });

        const model = client.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: SYSTEM_PROMPT,
        });

        let userPrompt = prompt;
        if (existing_nodes && Array.isArray(existing_nodes) && existing_nodes.length > 0) {
          userPrompt += `\n\nThe current canvas already has: ${JSON.stringify(
            existing_nodes.map((n: any) => ({ id: n.id, type: n.type, label: n.data?.label }))
          )}. Modify or extend this workflow. Reuse existing IDs where they should remain.`;
        }

        const result = await model.generateContentStream(userPrompt);

        let buffer = '';
        let lastNodeCount = 0;
        let lastEdgeCount = 0;
        let nameSent = false;

        for await (const chunk of result.stream) {
          const text = chunk.text();
          buffer += text;

          if (!nameSent) {
            const name = extractStringField(buffer, 'name');
            if (name && name.length > 1) {
              push('name', { name });
              nameSent = true;
            }
          }

          const { nodes, edges } = tryParsePartialNodes(buffer);

          for (let i = lastNodeCount; i < nodes.length; i++) {
            const node = nodes[i];
            if (node && node.id && node.type) {
              push('node', { node });
            }
          }
          lastNodeCount = nodes.length;

          for (let i = lastEdgeCount; i < edges.length; i++) {
            const edge = edges[i];
            if (edge && edge.source && edge.target) {
              push('edge', { edge });
            }
          }
          lastEdgeCount = edges.length;
        }

        const final = extractJson(buffer);
        if (final) {
          const explanation =
            final.explanation || extractStringField(buffer, 'explanation') || '';
          const name = final.name || extractStringField(buffer, 'name') || 'Untitled Workflow';

          if (!nameSent && name) push('name', { name });

          let nodes = Array.isArray(final.nodes) ? final.nodes : [];
          let edges = Array.isArray(final.edges) ? final.edges : [];

          const hasTrigger = nodes.some(
            (n: any) =>
              n?.type === 'trigger' || n?.type === 'webhook' || n?.type === 'schedule'
          );
          if (!hasTrigger && nodes.length > 0) {
            const triggerNode = {
              id: 'trigger-auto',
              type: 'trigger',
              position: { x: 120, y: 240 },
              data: { label: 'Manual Trigger', description: 'Starts the workflow' },
            };
            nodes = [triggerNode, ...nodes];
            edges = [
              {
                id: 'edge-trigger-auto',
                source: 'trigger-auto',
                target: nodes[1].id,
                animated: true,
              },
              ...edges,
            ];
            push('node', { node: triggerNode });
          }

          push('complete', {
            name,
            explanation,
            nodes,
            edges,
          });
        } else {
          push('error', { message: 'Could not parse workflow from AI response.' });
        }
      } catch (err) {
        push('error', {
          message: err instanceof Error ? err.message : 'Generation failed',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
