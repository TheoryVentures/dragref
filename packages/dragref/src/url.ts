export type ReferenceUrlOptions = {
  /** Context identifier, e.g. `market_map:7f3c9a:company:acme`. */
  context?: string;
  /** Query parameter name for `context`. */
  contextParam?: string;
  /** Extra query parameters; `undefined` values are skipped. */
  params?: Record<string, string | number | boolean | undefined>;
  /** Fragment without the leading `#`. */
  hash?: string;
};

export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

export function assertHttpUrl(value: string, what = "url"): void {
  if (!isHttpUrl(value)) {
    throw new TypeError(
      `dragref: ${what} must be an absolute http(s) URL (got ${JSON.stringify(value)}). ` +
        "Receivers such as Claude reject or drop other schemes.",
    );
  }
}

/** Builds a page URL that carries a context identifier in its query string. */
export function buildReferenceUrl(base: string | URL, options: ReferenceUrlOptions = {}): string {
  const url = new URL(base);
  assertHttpUrl(url.href);
  if (options.context !== undefined) {
    url.searchParams.set(options.contextParam ?? "context", options.context);
  }
  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  if (options.hash !== undefined) url.hash = options.hash;
  return url.href;
}
