/**
 * CSV取込バリデーション
 */

import { FIELD_TYPE } from "../config";

import type { AppSchema, KintoneRecord } from "../types";
const maxRecords = 500;
/**
 * バリデーションエラー
 */
export interface ValidationError {
  row: number;
  fieldCode: string;
  message: string;
}

/**
 * レコード一覧バリデーション
 *
 * @param records kintone records
 * @param schema app schema
 */
export function validateRecords(
  records: KintoneRecord[],
  schema: AppSchema,
): void {
  const errors: ValidationError[] = [];
  if (records.length > maxRecords) {
    throw new Error(
      `CSVレコード数が上限を超えています。\n
    最大:${maxRecords}件`,
    );
  }
  for (let index = 0; index < records.length; index++) {
    const record = records[index];

    const row = index + 2;

    const rowErrors = validateRecord(record, schema, row);

    errors.push(...rowErrors);
  }

  if (errors.length) {
    throwError(errors);
  }
}

/**
 * 単一レコードチェック
 *
 * @param record record
 * @param schema schema
 * @param row csv row
 * @returns errors
 */
function validateRecord(
  record: KintoneRecord,
  schema: AppSchema,
  row: number,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (record.length)
    for (const [fieldCode, fieldInfo] of Object.entries(schema.fields)) {
      const value = record[fieldCode]?.value;

      /**
       * 必須チェック
       */
      if (fieldInfo.required && isEmpty(value)) {
        errors.push({
          row,
          fieldCode,
          message: "必須項目です",
        });

        continue;
      }

      /**
       * 型チェック
       */
      const error = validateField(value, fieldInfo);

      if (error) {
        errors.push({
          row,
          fieldCode,
          message: error,
        });
      }
    }

  return errors;
}

/**
 * フィールド単位バリデーション
 *
 * @param value value
 * @param fieldInfo field
 * @returns error message
 */
function validateField(
  value: unknown,
  fieldInfo: {
    type: string;
    options?: Record<string, unknown>;
  },
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  switch (fieldInfo.type) {
    /**
     * 数値
     */
    case FIELD_TYPE.NUMBER:
      return typeof value === "number" ? null : "数値を入力してください";

    /**
     * チェックボックス
     * 複数選択
     */
    case FIELD_TYPE.CHECK_BOX:
    case FIELD_TYPE.MULTI_SELECT:
      return validateOptions(value, fieldInfo.options);

    default:
      return null;
  }
}

/**
 * 選択肢チェック
 *
 * @param value selected value
 * @param options option master
 * @returns error
 */
function validateOptions(
  value: unknown,
  options?: Record<string, unknown>,
): string | null {
  if (!Array.isArray(value) || !options) {
    return null;
  }

  for (const item of value) {
    if (!options[String(item)]) {
      return `存在しない選択肢: ${item}`;
    }
  }

  return null;
}

/**
 * 空判定
 *
 * @param value value
 * @returns result
 */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

/**
 * エラー表示
 *
 * @param errors errors
 */
function throwError(errors: ValidationError[]): never {
  const message = errors
    .map((error) => `${error.row}行目 / ${error.fieldCode} : ${error.message}`)
    .join("\n");

  throw new Error(`CSV取込エラー\n\n${message}`);
}
