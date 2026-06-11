import type { AppSchema } from "../types";

/**
 * 更新キー妥当性チェック
 *
 * 重複禁止フィールドのみ許可
 *
 * @param updateKey 更新キー
 * @param schema アプリschema
 */
export function validateUpdateKey(updateKey: string, schema: AppSchema): void {
  const field = schema.fields[updateKey];

  /**
   * フィールド存在確認
   */
  if (!field) {
    throw new Error(`更新キー「${updateKey}」が存在しません。`);
  }

  /**
   * 重複禁止チェック
   */
  if (!field.unique) {
    throw new Error(
      `更新キー「${updateKey}」は重複禁止フィールドではありません。`,
    );
  }
}
