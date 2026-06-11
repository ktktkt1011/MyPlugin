/**
 * アプリスキーマ取得
 */

import { KintoneRestAPIClient } from "@kintone/rest-api-client";

import type { AppSchema, FieldInfo, TableInfo } from "../types";

/**
 * requiredを持つ型
 */
type RequiredField = {
  required?: boolean;
};

/**
 * uniqueを持つ型
 */
type UniqueField = {
  unique?: boolean;
};

/**
 * subtable型
 */
type SubtableField = {
  type: "SUBTABLE";
  fields: Record<
    string,
    {
      label?: string;
      type: string;
      required?: boolean;
    }
  >;
};

/**
 * required判定
 */
function hasRequired(field: unknown): field is RequiredField {
  return typeof field === "object" && field !== null && "required" in field;
}

/**
 * unique判定
 */
function hasUnique(field: unknown): field is UniqueField {
  return typeof field === "object" && field !== null && "unique" in field;
}

/**
 * subtable判定
 */
function isSubtable(field: unknown): field is SubtableField {
  return (
    typeof field === "object" &&
    field !== null &&
    "type" in field &&
    (
      field as {
        type?: string;
      }
    ).type === "SUBTABLE" &&
    "fields" in field
  );
}

/**
 * アプリスキーマ取得
 *
 * @param appId app id
 * @returns schema
 */
export async function getAppSchema(appId: number): Promise<AppSchema> {
  const client = new KintoneRestAPIClient();

  const response = await client.app.getFormFields({
    app: appId,
  });

  const fields: Record<string, FieldInfo> = {};

  const requiredFields: string[] = [];

  const tables: Record<string, TableInfo> = {};

  for (const [fieldCode, field] of Object.entries(response.properties)) {
    const required = hasRequired(field) ? (field.required ?? false) : false;

    const unique = hasUnique(field) ? (field.unique ?? false) : false;

    const fieldInfo: FieldInfo = {
      code: fieldCode,
      label: field.label ?? fieldCode,
      type: field.type,
      required,
      unique,
    };

    fields[fieldCode] = fieldInfo;

    /**
     * 必須項目
     */
    if (required) {
      requiredFields.push(fieldCode);
    }

    /**
     * サブテーブル
     */
    if (isSubtable(field)) {
      const tableFields: Record<string, FieldInfo> = {};

      for (const [subCode, subField] of Object.entries(field.fields)) {
        tableFields[subCode] = {
          code: subCode,
          label: subField.label ?? subCode,
          type: subField.type,
          required: subField.required ?? false,
          unique: false,
        };
      }

      tables[fieldCode] = {
        code: fieldCode,
        fields: tableFields,
      };
    }
  }

  return {
    fields,
    requiredFields,
    tables,
  };
}

export function getRecordNumberFieldCode(schema: AppSchema): string | null {
  for (const [fieldCode, fieldInfo] of Object.entries(schema.fields)) {
    if (fieldInfo.type === "RECORD_NUMBER") {
      return fieldCode;
    }
  }

  return null;
}
