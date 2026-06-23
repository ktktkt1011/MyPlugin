import type { KintoneRecord } from "../types";
import type { CsvImportHook } from "../types";

export type CsvHook = (
  records: KintoneRecord[],
  saveWay: string,
  updateKey: string,
) => Promise<KintoneRecord[]>;

declare global {
  interface Window {
    csvImportHook?: CsvHook;
  }
}

export async function runHook(
  records: KintoneRecord[],
  saveWay: string,
  updateKey: string,
): Promise<KintoneRecord[]> {
  if (!window.csvImportHook) {
    return records;
  }

  return await window.csvImportHook(records, saveWay, updateKey);
}
