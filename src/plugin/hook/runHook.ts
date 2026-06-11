import type { KintoneRecord } from "../types";

export type CsvHook = (records: KintoneRecord[]) => Promise<KintoneRecord[]>;

declare global {
  interface Window {
    csvImportHook?: CsvHook;
  }
}

export async function runHook(
  records: KintoneRecord[],
): Promise<KintoneRecord[]> {
  if (!window.csvImportHook) {
    return records;
  }

  return await window.csvImportHook(records);
}
