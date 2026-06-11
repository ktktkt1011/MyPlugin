/**
 * CSVファイル読込
 *
 * UTF-8 / Shift-JIS対応
 */

import { CSV_ENCODINGS } from "../config";

/**
 * CSV文字列読込
 *
 * @param file ファイル
 * @returns CSV文字列
 */
export async function readCsv(file: File): Promise<string> {
  validateCsvFile(file);

  const buffer = await file.arrayBuffer();

  const uint8Array = new Uint8Array(buffer);

  for (const encoding of CSV_ENCODINGS) {
    try {
      const text = decodeText(uint8Array, encoding);

      if (isValidCsv(text)) {
        return removeBom(text);
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    "CSVファイルの読み込みに失敗しました。文字コードをご確認ください。",
  );
}

/**
 * CSVファイルチェック
 *
 * @param file ファイル
 */
function validateCsvFile(file: File): void {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension !== "csv") {
    throw new Error("CSVファイルのみ取り込み可能です。");
  }

  /**
   * xlsx誤アップロード対策
   */
  if (file.type.includes("spreadsheetml")) {
    throw new Error(
      "Excelファイル（xlsx）は対応していません。CSV形式で保存してください。",
    );
  }
}

/**
 * テキストデコード
 *
 * @param data byte array
 * @param encoding 文字コード
 * @returns テキスト
 */
function decodeText(data: Uint8Array, encoding: string): string {
  const decoder = new TextDecoder(encoding);

  return decoder.decode(data);
}

/**
 * CSVっぽいか判定
 *
 * @param text CSV文字列
 * @returns true: CSV
 */
function isValidCsv(text: string): boolean {
  if (!text.trim()) {
    return false;
  }

  /**
   * xlsx(zip)対策
   */
  if (text.includes("PK") && text.includes("[Content_Types]")) {
    return false;
  }

  /**
   * 文字化け判定
   */
  if (isGarbledText(text)) {
    return false;
  }

  const firstLine = text.split(/\r?\n/)[0];

  return firstLine.includes(",");
}

/**
 * BOM除去
 *
 * UTF-8 BOM対応
 *
 * @param text text
 * @returns text
 */
function removeBom(text: string): string {
  return text.replace(/^\uFEFF/, "");
}

function isGarbledText(text: string): boolean {
  /**
   * UTF-8誤読時の典型文字
   */
  const garbledChars = ["�", "���"];

  for (const char of garbledChars) {
    if (text.includes(char)) {
      return true;
    }
  }

  return false;
}
