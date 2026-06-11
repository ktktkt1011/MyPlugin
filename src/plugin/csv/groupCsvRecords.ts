import type { CsvRecord } from "../types";

export function groupCsvRecords(csvRows: CsvRecord[]): CsvRecord[][] {
  const groupedRecords: CsvRecord[][] = [];

  let currentRecord: CsvRecord[] = [];

  for (const row of csvRows) {
    const isStart = row["レコードの開始行"] === "*";

    /**
     * 新レコード開始
     */
    if (isStart) {
      if (currentRecord.length) {
        groupedRecords.push(currentRecord);
      }

      currentRecord = [row];

      continue;
    }

    /**
     * テーブル継続行
     */
    currentRecord.push(row);
  }

  /**
   * 最後
   */
  if (currentRecord.length) {
    groupedRecords.push(currentRecord);
  }

  return groupedRecords;
}
