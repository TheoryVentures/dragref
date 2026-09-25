import { appendJsonl } from "@/lib/research-log";

export async function POST(request: Request) {
  const entry = await request.json();
  await appendJsonl("drag-log.jsonl", entry);
  return new Response(null, { status: 204 });
}
