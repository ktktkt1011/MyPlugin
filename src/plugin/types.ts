/**
 * kintone レコード型
 */
export type KintoneFieldValue =
  | string
  | number
  | string[]
  | { code: string }[]
  | null;

export interface KintoneRecord {
  [fieldCode: string]: {
    value: KintoneFieldValue;
  };
}

/**
 * CSVレコード
 *
 * PapaParseで変換後の形
 */
export interface CsvRecord {
  [key: string]: string;
}

/**
 * kintoneフィールド情報
 */
export interface FieldInfo {
  code: string;
  label: string;
  type: string;
  required: boolean;
  unique: boolean;
  options?: Record<string, unknown>;

  /**
   * テーブル用
   */
  fields?: Record<string, FieldInfo>;
}

/**
 * テーブル情報
 */
export interface TableInfo {
  code: string;
  fields: Record<string, FieldInfo>;
}

/**
 * アプリスキーマ
 */
export interface AppSchema {
  fields: Record<string, FieldInfo>;
  requiredFields: string[];
  tables: Record<string, TableInfo>;
}

/**
 * import mode
 */
export type ImportMode = "create" | "update" | "upsert";

/**
 * hook context
 */
export interface HookContext {
  appId: number;
  schema: AppSchema;
  rawCsv: string;
  fileName: string;
  importMode: ImportMode;
}

/**
 * hook function
 */
export type CsvImportHook = (
  records: KintoneRecord[],
  context: HookContext,
) => Promise<KintoneRecord[]> | KintoneRecord[];

/**
 * Window拡張
 */
declare global {
  interface Window {
    CSV_IMPORT_HOOK?: CsvImportHook;
  }
}

export interface GroupedCsvRecord {
  rows: CsvRecord[];
}

export {};
