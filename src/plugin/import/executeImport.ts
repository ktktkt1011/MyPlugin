import { getAppSchema } from "../schema/getAppSchema";
import { convertRecords } from "../convert/convertRecord";
import { validateRecords } from "../validate/validateRecord";
import { runHook } from "../hook/runHook";

import type { CsvRecord } from "../types";

export async function executeImport(
  csvRecords: CsvRecord[],
  saveWay: string,
  updateKey: string,
): Promise<void> {
  /**
   * appId取得
   */
  const appId = kintone.app.getId();

  if (!appId) {
    throw new Error("アプリID取得失敗");
  }

  /**
   * schema取得
   */
  const schema = await getAppSchema(appId);

  /**
   * csv → kintone変換
   */
  const convertedRecords = convertRecords(csvRecords, schema);

  const filteredRecords = convertedRecords.filter((record) => record);

  /**
   * 必須・型チェック
   */
  validateRecords(filteredRecords, schema);

  /**
   * hook実行
   */
  const hookRecords = await runHook(convertedRecords, saveWay, updateKey);

  /**
   * create/update
   */
  console.log(hookRecords);
}
