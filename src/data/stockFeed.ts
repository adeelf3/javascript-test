export type StockUpdate = { id: string; stock: number };

export function startStockFeed(
  read: () => Promise<StockUpdate>,
  onUpdate: (update: StockUpdate) => void,
  intervalMs = 12_000,
): () => void {
  let active = true;
  let failures = 0;
  let timer: ReturnType<typeof setTimeout>;

  function schedule(delay: number) {
    timer = setTimeout(() => void poll(), delay);
  }

  async function poll() {
    try {
      const update = await read();
      if (!active) return;
      failures = 0;
      onUpdate(update);
      schedule(intervalMs);
    } catch {
      if (!active) return;
      failures += 1;
      schedule(Math.min(1000 * 2 ** (failures - 1), 12_000));
    }
  }

  schedule(intervalMs);
  return () => {
    active = false;
    clearTimeout(timer);
  };
}
