import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_STATE = {
  version: 1,
  intents: {},
  sales: {},
  usedPaymentSignatures: {}
};

export class JsonStateStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.state = structuredClone(DEFAULT_STATE);
    this.queue = Promise.resolve();
  }

  async init() {
    const absPath = path.resolve(this.filePath);
    await mkdir(path.dirname(absPath), { recursive: true });
    this.filePath = absPath;

    try {
      const raw = await readFile(absPath, "utf8");
      const parsed = JSON.parse(raw);
      this.state = {
        ...structuredClone(DEFAULT_STATE),
        ...parsed,
        intents: parsed?.intents ?? {},
        sales: parsed?.sales ?? {},
        usedPaymentSignatures: parsed?.usedPaymentSignatures ?? {}
      };
    } catch {
      this.state = structuredClone(DEFAULT_STATE);
      await this.persist();
    }
  }

  async runExclusive(fn) {
    const runner = this.queue.then(async () => fn(this.state));
    this.queue = runner.catch(() => {});
    return runner;
  }

  async persist() {
    await writeFile(this.filePath, JSON.stringify(this.state, null, 2), "utf8");
  }
}