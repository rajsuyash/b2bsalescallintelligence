import Groq from "groq-sdk";
import fs from "fs";

const MOCK_TRANSCRIPTS = [
  "Sales rep: Good morning sir, thank you for meeting with us today. I wanted to discuss our latest wire rope products for your upcoming project.\n\nCustomer: Yes, we've been looking at options for the new construction phase. What do you have?\n\nSales rep: We have our premium 6x36 wire ropes that are perfect for heavy lifting applications. Very durable and cost-effective.\n\nCustomer: That sounds promising. Can you send us a detailed quote for 10 units?\n\nSales rep: Absolutely, I'll have that ready by tomorrow. We can also offer priority delivery.\n\nCustomer: Good. Let's proceed with the quotation first and we'll take it from there.",
];

export async function transcribeAudio(audioPath: string): Promise<string> {
  if (process.env.MOCK_AI === "true") {
    await new Promise((r) => setTimeout(r, 2000));
    return MOCK_TRANSCRIPTS[0];
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-large-v3",
    response_format: "text",
  });

  return transcription as unknown as string;
}
