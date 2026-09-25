/** A reference to something in your app, as seen by the app it is dropped into. */
export type DragReference = {
  /** Short human-readable label; becomes the link text. */
  label: string;
  /** Absolute http(s) URL of the referenced page. */
  url: string;
  /** Structured data written as JSON under a custom MIME type, for cooperating receivers. */
  data?: unknown;
  /** A file the browser can materialize when the receiver supports file promises (Chrome only). */
  file?: DragFile;
};

export type DragFile = {
  /** File name including extension, e.g. `acme.json`. Must not contain `:`. */
  name: string;
  /** Absolute http(s) URL the browser downloads the file from. */
  url: string;
  /** MIME type of the file, e.g. `application/json`. */
  mimeType: string;
};

/**
 * What `text/plain` contains. Receivers that render HTML (e.g. Claude) ignore it; plain-text
 * receivers (terminals, some editors) show only this.
 */
export type PlainTextFormat = "label" | "label-url" | "markdown" | "url";

export type ApplyOptions = {
  plainText?: PlainTextFormat;
  /** MIME type for `data`. */
  dataMimeType?: string;
};

/** The subset of a DOM or React drag event that `handleDragStart` needs. */
export type DragStartEventLike = {
  dataTransfer: DataTransfer | null;
  stopPropagation(): void;
  preventDefault(): void;
};
