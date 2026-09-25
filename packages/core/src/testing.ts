/** A `Map`-backed `DataTransfer` stand-in for jsdom and Node tests. */
export type MockDataTransfer = DataTransfer & {
  /** Every flavor currently set, keyed by lowercase type. */
  readonly data: Map<string, string>;
};

export function createMockDataTransfer(seed: Record<string, string> = {}): MockDataTransfer {
  const data = new Map(Object.entries(seed).map(([k, v]) => [k.toLowerCase(), v]));
  const mock = {
    data,
    dropEffect: "none",
    effectAllowed: "uninitialized",
    files: [] as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
    get types() {
      return [...data.keys()];
    },
    setData(format: string, value: string) {
      data.set(format.toLowerCase(), value);
    },
    getData(format: string) {
      return data.get(format.toLowerCase()) ?? "";
    },
    clearData(format?: string) {
      if (format === undefined) data.clear();
      else data.delete(format.toLowerCase());
    },
    setDragImage() {},
  };
  return mock as unknown as MockDataTransfer;
}
