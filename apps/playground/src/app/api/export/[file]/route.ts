import { appendJsonl } from "@/lib/research-log";
import { SAMPLE_JSON } from "@/lib/sample-data";

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function body(file: string): { content: BodyInit; type: string } | null {
  if (file.endsWith(".json")) {
    return { content: JSON.stringify(SAMPLE_JSON, null, 2), type: "application/json" };
  }
  if (file.endsWith(".md")) {
    const { name, fields, url } = SAMPLE_JSON;
    const md = `# ${name}\n\n- Stage: ${fields.stage}\n- Sector: ${fields.sector}\n- Headcount: ${fields.headcount}\n\n${url}\n`;
    return { content: md, type: "text/markdown; charset=utf-8" };
  }
  if (file.endsWith(".png")) {
    return { content: Buffer.from(PNG_BASE64, "base64"), type: "image/png" };
  }
  return null;
}

// A fetch here means some receiver asked the browser to materialize a promised file.
export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const url = new URL(request.url);
  await appendJsonl("export-log.jsonl", {
    event: "export-fetch",
    file,
    variantId: url.searchParams.get("v"),
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("user-agent"),
  });
  const result = body(file);
  if (!result) return new Response("not found", { status: 404 });
  return new Response(result.content, {
    headers: {
      "Content-Type": result.type,
      "Content-Disposition": `attachment; filename="${file}"`,
      "Cache-Control": "no-store",
    },
  });
}
