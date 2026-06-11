/**
 * CSV → kintone record変換
 */

import { FIELD_TYPE } from "../config";
import { groupCsvRecords } from "../csv/groupCsvRecords";
import type { AppSchema, CsvRecord, KintoneRecord, FieldInfo } from "../types";

const EXCLUDED_FIELD_TYPES: string[] = [
  "RECORD_NUMBER",
  "CREATOR",
  "CREATED_TIME",
  "MODIFIER",
  "UPDATED_TIME",
  "STATUS",
  "STATUS_ASSIGNEE",
  "CATEGORY",
] as const;

export function getExcludedFieldCodes(
  schema: AppSchema,
  excludeFieldCodes: string[],
): string[] {
  const fieldCodes: string[] = [];

  for (const [fieldCode, fieldInfo] of Object.entries(schema.fields)) {
    if (excludeFieldCodes.includes(fieldInfo.type as any)) {
      fieldCodes.push(fieldCode);
    }
  }

  return fieldCodes;
}

function hasSubtableFormat(csvRecords: CsvRecord[]): boolean {
  const firstRow = csvRecords[0];

  if (!firstRow) {
    return false;
  }

  return "レコードの開始行" in firstRow;
}

function getSubtableFieldMap(schema: AppSchema): Record<
  string,
  {
    tableCode: string;
    fieldCode: string;
    type: string;
  }
> {
  const fieldMap: Record<
    string,
    {
      tableCode: string;
      fieldCode: string;
      type: string;
    }
  > = {};

  for (const [tableCode, tableInfo] of Object.entries(schema.tables)) {
    for (const [fieldCode, fieldInfo] of Object.entries(tableInfo.fields)) {
      fieldMap[fieldInfo.label] = {
        tableCode,
        fieldCode,
        type: fieldInfo.type,
      };
    }
  }

  return fieldMap;
}
function appendSubtableRow(
  record: KintoneRecord,
  csvRecord: any,
  subtableFieldMap: Record<
    string,
    {
      tableCode: string;
      fieldCode: string;
      type: string;
    }
  >,
): void {
  const tableRows: Record<string, KintoneRecord> = {};

  for (const [csvHeader, rawValue] of Object.entries(csvRecord)) {
    const mapping = subtableFieldMap[csvHeader];

    if (!mapping) {
      continue;
    }

    const { tableCode, fieldCode, type } = mapping;

    if (!tableRows[tableCode]) {
      tableRows[tableCode] = {};
    }

    tableRows[tableCode][fieldCode] = {
      value: convertValue(rawValue as string, type),
    };
  }

  /**
   * record反映
   */
  for (const [tableCode, rowRecord] of Object.entries(tableRows)) {
    if (!record[tableCode]) {
      record[tableCode] = {
        value: [],
      };
    }

    const tableField = record[tableCode] as unknown as {
      value: {
        value: KintoneRecord;
      }[];
    };

    tableField.value.push({
      value: rowRecord,
    });
  }
}

function convertGroupedRecords(
  csvRecords: any[][],
  schema: AppSchema,
): KintoneRecord[] {
  const results: KintoneRecord[] = [];

  /**
   * サブテーブル所属field
   */
  const subtableFieldMap = getSubtableFieldMap(schema);

  let currentRecord: KintoneRecord | null = null;

  for (const csvRecord of csvRecords) {
    for (const csvData of csvRecord) {
      const isStart = csvData["レコードの開始行"] === "*";

      /* 新レコード */
      if (isStart) {
        currentRecord = convertRecord([csvData], schema);
        results.push(currentRecord);
      }
      /* サブテーブル行 */
      if (!currentRecord) {
        continue;
      }
      appendSubtableRow(currentRecord, csvData, subtableFieldMap);
    }
  }
  return results;
}

/**
 * CSV records変換
 *
 * @param csvRecords csv data
 * @param schema app schema
 * @returns kintone records
 */
export function convertRecords(
  csvRecords: any[],
  schema: AppSchema,
): KintoneRecord[] {
  /* サブテーブル形式 */
  if (hasSubtableFormat(csvRecords)) {
    return convertGroupedRecords(groupCsvRecords(csvRecords), schema);
  }

  /* 通常CSV */
  const results: KintoneRecord[] = [];
  for (const csvRecord of csvRecords) {
    const converted = convertRecord([csvRecord], schema);
    results.push(converted);
  }

  return results;
}

/**
 * CSV record変換
 *
 * @param csvRecord csv row
 * @param schema app schema
 * @returns kintone record
 */
function convertRecord(csvRecord: any, schema: AppSchema): KintoneRecord {
  const record: KintoneRecord = {};

  for (const [fieldCode, fieldInfo] of Object.entries(schema.fields)) {
    /* サブテーブル所属フィールド */
    const subtableInfo = getSubtableFieldInfo(fieldCode, schema);

    if (subtableInfo) {
      const { tableCode, fieldInfo } = subtableInfo;

      const rawValue = csvRecord[fieldInfo.label];

      /* 値なし */
      if (rawValue !== undefined && rawValue !== "") {
        /* table初期化 */
        if (!record[tableCode]) {
          record[tableCode] = {
            value: [],
          };
        }

        /* row初期化 */
        if (!record[tableCode].value) continue;
        const tableField = record[tableCode] as unknown as {
          value: {
            value: KintoneRecord;
          }[];
        };

        if (tableField.value.length === 0) {
          tableField.value.push({
            value: {},
          });
        }

        const tableRow = tableField.value[0].value;

        tableRow[fieldCode] = {
          value: convertValue(rawValue, fieldInfo.type),
        };
      }

      continue;
    }
    /* 複数選択 */
    if (
      fieldInfo.type === FIELD_TYPE.CHECK_BOX ||
      fieldInfo.type === FIELD_TYPE.MULTI_SELECT
    ) {
      const selectedValues = getMultiSelectValues(csvRecord[0], fieldCode);
      record[fieldCode] = {
        value: selectedValues,
      };
      continue;
    }

    /**
     * 通常CSV値取得
     */
    const rawValue = csvRecord[0][fieldCode];
    if (!rawValue) continue;
    const value = convertValue(rawValue, fieldInfo.type);
    record[fieldCode] = { value };
  }
  return record;
}
function getSubtableFieldInfo(
  fieldCode: string,
  schema: AppSchema,
): {
  tableCode: string;
  fieldInfo: FieldInfo;
} | null {
  for (const [tableCode, tableInfo] of Object.entries(schema.tables)) {
    const fieldInfo = tableInfo.fields[fieldCode];

    if (fieldInfo) {
      return { tableCode, fieldInfo };
    }
  }

  return null;
}
/**
 * 値変換
 *
 * @param value csv value
 * @param fieldType kintone type
 * @returns converted value
 */
function convertValue(
  value: string,
  fieldType: string,
): string | number | string[] | { code: string }[] | null {
  /* 空文字 */
  if (!value) return null;

  switch (fieldType) {
    /* 数値 */
    case FIELD_TYPE.NUMBER:
      return Number(value);

    /* チェックボックス 複数選択 */
    case FIELD_TYPE.CHECK_BOX:
    case FIELD_TYPE.MULTI_SELECT:
      return value.split(";").map((item) => item.trim());

    /* ユーザー、組織、グループ選択 */
    case FIELD_TYPE.USER_SELECT:
    case FIELD_TYPE.ORGANIZATION_SELECT:
    case FIELD_TYPE.GROUP_SELECT:
      return value.split(";").map((code) => ({
        code: code.trim(),
      }));

    /* 日付系 */
    case FIELD_TYPE.DATE:
    case FIELD_TYPE.TIME:
    case FIELD_TYPE.DATETIME:
      return value.split("/").join("-").replace(" ", "T");

    /* デフォルト */
    default:
      return value;
  }
}

/**
 * 複数選択にて設定した値を
 * @param csvRecord
 * @param fieldCode
 * @returns
 */
function getMultiSelectValues(
  csvRecord: CsvRecord,
  fieldCode: string,
): string[] {
  const selectedValues: string[] = [];

  const prefix = `${fieldCode}[`;

  for (const [csvKey, value] of Object.entries(csvRecord)) {
    /**
     * 対象フィールド以外
     */
    if (!csvKey.startsWith(prefix)) {
      continue;
    }

    /* 未選択の場合 */
    if (value !== "1") continue;

    /**
     * []内の選択肢抽出
     *
     * チェックボックス[sample1]
     * → sample1
     */
    const match = csvKey.match(/\[(.+?)\]/);
    if (!match) continue;
    selectedValues.push(match[1]);
  }

  return selectedValues;
}
