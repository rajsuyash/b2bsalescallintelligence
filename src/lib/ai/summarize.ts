import Anthropic from "@anthropic-ai/sdk";

interface SummaryResult {
  summaryText: string;
  extractedFields: Record<string, string>;
  outcomeLabel: "Order" | "Complaint" | "Normal Visit";
  outcomeConfidence: number;
  complaintSeverity?: "low" | "medium" | "high" | "critical";
}

const MOCK_RESULT: SummaryResult = {
  summaryText:
    "Routine sales visit discussing wire rope requirements for upcoming construction project. Customer interested in 6x36 wire ropes and requested a detailed quote for 10 units. Priority delivery discussed. Positive engagement with next steps defined.",
  extractedFields: {
    products: "6x36 wire ropes",
    quantity: "10 units",
    nextSteps: "Send detailed quotation by tomorrow",
    sentiment: "Positive",
  },
  outcomeLabel: "Normal Visit",
  outcomeConfidence: 0.88,
};

export async function summarizeTranscript(
  transcript: string
): Promise<SummaryResult> {
  if (process.env.MOCK_AI === "true") {
    await new Promise((r) => setTimeout(r, 3000));
    return MOCK_RESULT;
  }

  // If no valid Anthropic key, return a basic fallback summary from the transcript
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith("sk-ant-...")) {
    const snippet = transcript.slice(0, 200);
    return {
      summaryText: `Call transcript recorded. ${snippet}...`,
      extractedFields: { note: "Summarization unavailable — no Anthropic API key configured" },
      outcomeLabel: "Normal Visit",
      outcomeConfidence: 0.5,
    };
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert B2B sales call analyst for an industrial wire rope company (Usha Martin). Analyze this sales call transcript and classify it accurately.

CLASSIFICATION RULES (apply in order):
1. **"Order"** — Customer expresses intent to buy, place an order, requests a quote/pricing, asks for quantities, confirms a purchase, says "send PO", "let's go ahead", "we need X units", "send me a quote", or any buying signal. Even if the order is not finalized yet, if the customer is actively moving toward purchasing, classify as Order.
2. **"Complaint"** — Customer raises issues about quality, delivery delays, defects, failures, documentation problems, or expresses dissatisfaction with products/service.
3. **"Normal Visit"** — Routine check-in, relationship building, information sharing, product introduction, or follow-up with no buying signal and no complaint.

IMPORTANT: When in doubt between "Order" and "Normal Visit", lean toward "Order" if ANY buying intent or purchase discussion is present.

Return a JSON object with:
- summaryText: 2-3 sentence summary of the call
- extractedFields: object with relevant fields (products, quantities, order value, next steps, etc.)
- outcomeLabel: exactly one of "Order", "Complaint", or "Normal Visit" (follow the rules above strictly)
- outcomeConfidence: number 0-1
- complaintSeverity: only if outcomeLabel is "Complaint", one of "low", "medium", "high", "critical"

Transcript:
${transcript}

Return ONLY valid JSON, no markdown or explanation.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text) as SummaryResult;
}
