/**
 * CSV解析
 */

import Papa from "papaparse";
import type { CsvRecord } from "../types";

/**
 * CSV文字列解析
 *
 * @param csvText CSV文字列
 * @returns CSVデータ
 */
export function parseCsv(csvText: string): CsvRecord[] {
  const result = Papa.parse<CsvRecord>(csvText, {
    header: true,

    /**
     * 空行除外
     */
    skipEmptyLines: true,

    /**
     * ヘッダーtrim
     */
    transformHeader: (header): string => header.trim(),

    /**
     * 値trim
     */
    transform: (value): string => value.trim(),
  });

  if (result.errors.length) {
    const firstError = result.errors[0];

    throw new Error(`CSV解析エラー: ${firstError.message}`);
  }

  return result.data;
}
