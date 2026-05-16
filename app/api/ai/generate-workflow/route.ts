import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

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

export async function POST(request: NextRequest) {
  try {
    const { prompt, existing_nodes } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const model = client.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    let userPrompt = prompt;
    if (existing_nodes && Array.isArray(existing_nodes) && existing_nodes.length > 0) {
      userPrompt += `\n\nCurrent canvas: ${JSON.stringify(
        existing_nodes.map((n: any) => ({ id: n.id, type: n.type, label: n.data?.label }))
      )}. Modify or extend. Keep existing IDs where they should remain.`;
    }

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON in AI response');
      parsed = JSON.parse(match[0]);
    }

    if (!Array.isArray(parsed.nodes)) {
      return NextResponse.json({ error: 'Invalid AI output: missing nodes' }, { status: 500 });
    }
    if (!Array.isArray(parsed.edges)) parsed.edges = [];

    const triggerTypes = new Set(['trigger', 'webhook', 'schedule']);
    const hasTrigger = parsed.nodes.some((n: any) => triggerTypes.has(n?.type));
    if (!hasTrigger && parsed.nodes.length > 0) {
      const triggerNode = {
        id: 'trigger-auto',
        type: 'trigger',
        position: { x: 120, y: 240 },
        data: { label: 'Manual Trigger', description: 'Starts the workflow' },
      };
      parsed.nodes = [triggerNode, ...parsed.nodes];
      parsed.edges = [
        {
          id: 'edge-trigger-auto',
          source: 'trigger-auto',
          target: parsed.nodes[1].id,
          animated: true,
        },
        ...parsed.edges,
      ];
    }

    return NextResponse.json({
      name: parsed.name || 'Untitled Workflow',
      explanation: parsed.explanation || 'Workflow generated successfully.',
      nodes: parsed.nodes,
      edges: parsed.edges,
    });
  } catch (error) {
    console.error('AI workflow generation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate workflow',
      },
      { status: 500 }
    );
  }
}
