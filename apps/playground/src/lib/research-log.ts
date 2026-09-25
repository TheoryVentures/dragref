import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export const RESEARCH_DIR = path.resolve(process.cwd(), "../../docs/research");

export async function appendJsonl(fileName: string, entry: unknown) {
  await mkdir(RESEARCH_DIR, { recursive: true });
  await appendFile(path.join(RESEARCH_DIR, fileName), `${JSON.stringify(entry)}\n`);
}
