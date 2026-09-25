import type {
  ApplyOptions,
  DragFile,
  DragReference,
  DragStartEventLike,
  PlainTextFormat,
} from "./types";
import { assertHttpUrl } from "./url";

export const DEFAULT_DATA_MIME_TYPE = "application/vnd.dragref+json";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const escapeMarkdownLabel = (value: string) => value.replace(/([\\[\]])/g, "\\$1");

export function formatPlainText(ref: DragReference, format: PlainTextFormat = "label"): string {
  switch (format) {
    case "label":
      return ref.label;
    case "label-url":
      return `${ref.label} (${ref.url})`;
    case "markdown":
      return `[${escapeMarkdownLabel(ref.label)}](${ref.url})`;
    case "url":
      return ref.url;
  }
}

function validateFile(file: DragFile): void {
  if (!file.name || file.name.includes(":")) {
    throw new TypeError(
      `dragref: file.name must be non-empty and contain no ":" (got ${JSON.stringify(file.name)})`,
    );
  }
  if (!/^[\w.+-]+\/[\w.+-]+$/.test(file.mimeType)) {
    throw new TypeError(
      `dragref: file.mimeType must look like "type/subtype" (got ${JSON.stringify(file.mimeType)})`,
    );
  }
  assertHttpUrl(file.url, "file.url");
}

export function validateDragReference(ref: DragReference): void {
  if (!ref.label?.trim()) throw new TypeError("dragref: label must be a non-empty string");
  assertHttpUrl(ref.url);
  if (ref.file) validateFile(ref.file);
}

/**
 * Replaces everything on `dataTransfer` with the reference payload: an http(s) URL, an HTML link,
 * plain text, and optionally JSON data and a downloadable file.
 */
export function applyDragReference(
  dataTransfer: DataTransfer,
  ref: DragReference,
  options: ApplyOptions = {},
): void {
  validateDragReference(ref);
  const label = ref.label.trim();
  const normalized = { ...ref, label };

  // Links and selections arrive pre-populated with browser-generated flavors that some
  // receivers prefer over ours.
  dataTransfer.clearData();
  dataTransfer.effectAllowed = "copyLink";
  dataTransfer.setData("text/uri-list", ref.url);
  dataTransfer.setData("text/html", `<a href="${escapeHtml(ref.url)}">${escapeHtml(label)}</a>`);
  dataTransfer.setData("text/plain", formatPlainText(normalized, options.plainText));
  if (ref.data !== undefined) {
    dataTransfer.setData(options.dataMimeType ?? DEFAULT_DATA_MIME_TYPE, JSON.stringify(ref.data));
  }
  if (ref.file) {
    dataTransfer.setData("DownloadURL", `${ref.file.mimeType}:${ref.file.name}:${ref.file.url}`);
  }
}

/**
 * A complete `dragstart` handler. Stops propagation so nested sources don't overwrite each
 * other, and cancels the drag when `ref` is null or undefined.
 */
export function handleDragStart(
  event: DragStartEventLike,
  ref: DragReference | null | undefined,
  options?: ApplyOptions,
): void {
  event.stopPropagation();
  if (!ref || !event.dataTransfer) {
    event.preventDefault();
    return;
  }
  applyDragReference(event.dataTransfer, ref, options);
}
