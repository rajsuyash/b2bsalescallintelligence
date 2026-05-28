import { AssemblyAI } from "assemblyai";

const MOCK_TRANSCRIPTS = [
  "Speaker A: Good morning sir, thank you for meeting with us today. I wanted to discuss our latest wire rope products for your upcoming project.\n\nSpeaker B: Yes, we've been looking at options for the new construction phase. What do you have?\n\nSpeaker A: We have our premium 6x36 wire ropes that are perfect for heavy lifting applications. Very durable and cost-effective.\n\nSpeaker B: That sounds promising. Can you send us a detailed quote for 10 units?\n\nSpeaker A: Absolutely, I'll have that ready by tomorrow. We can also offer priority delivery.\n\nSpeaker B: Good. Let's proceed with the quotation first and we'll take it from there.",
];

export async function transcribeAudio(audioPath: string): Promise<string> {
  if (process.env.MOCK_AI === "true") {
    await new Promise((r) => setTimeout(r, 2000));
    return MOCK_TRANSCRIPTS[0];
  }

  const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

  const transcript = await client.transcripts.transcribe({
    audio: audioPath,
    speaker_labels: true,
  });

  if (transcript.status === "error") {
    throw new Error(`AssemblyAI transcription failed: ${transcript.error}`);
  }

  if (!transcript.utterances || transcript.utterances.length === 0) {
    return transcript.text ?? "";
  }

  return transcript.utterances
    .map((u) => `Speaker ${u.speaker}: ${u.text}`)
    .join("\n\n");
}
