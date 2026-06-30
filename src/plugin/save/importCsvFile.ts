import type { KintoneRecord } from "../types";
import { IMPORT_MODE } from "../config";
import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import { getExcludedFieldCodes } from "../convert/convertRecord";
import { getRecordNumberFieldCode } from "../schema/getAppSchema";
import type { AppSchema } from "../types";
import { ProgressManager } from "../ui/ProgressDialog";
const progress = new ProgressManager();

const client = new KintoneRestAPIClient();
const CHUNK_SIZE = 100;

export async function importCsvFile(
  hookedRecords: KintoneRecord[],
  saveWay: string,
  updateKey: string,
  appSchema: AppSchema,
): Promise<void> {
  try {
    const appId = kintone.app.getId();
    if (!appId) return;
    console.log("IMPORT_MODE", IMPORT_MODE);

    /* 「作成」を選択した場合 */
    if (saveWay === IMPORT_MODE.CREATE) {
      try {
        let percent = 0;
        progress.start();
        progress.setProgress(percent);
        for (let i = 0; i < hookedRecords.length; i += CHUNK_SIZE) {
          const chunk = hookedRecords.slice(i, i + CHUNK_SIZE);

          await client.record.addRecords({
            app: appId,
            records: chunk,
          });
          progress.setProgress((CHUNK_SIZE / hookedRecords.length) * 100);
        }
        progress.done();
      } catch (error: any) {
        throw new Error(error);
      }

      /* 「更新または作成」を選択した場合 */
    } else if (saveWay === IMPORT_MODE.UPSERT) {
      await upsertRecords(hookedRecords, updateKey, appSchema, appId);

      /* 「更新」を選択した場合 */
    } else if (saveWay === IMPORT_MODE.UPDATE) {
      await updateRecords(hookedRecords, updateKey, appSchema, appId, false);
    }
  } catch (error: any) {
    throw new Error(error);
  }
}

async function updateRecords(
  hookedRecords: KintoneRecord[],
  updateKey: string,
  appSchema: AppSchema,
  appId: number,
  upsertFlag: boolean,
) {
  const excludedFieldCodes = getExcludedFieldCodes(appSchema, [
    "RECORD_NUMBER",
  ]);
  const CHUNK_SIZE = 100;
  let percent = 0;
  progress.start();
  progress.setProgress(percent);
  for (let i = 0; i < hookedRecords.length; i += CHUNK_SIZE) {
    const chunk = hookedRecords.slice(i, i + CHUNK_SIZE);
    const formattedRecords =
      excludedFieldCodes[0] === updateKey
        ? chunk.map((rec) => ({
            id: rec[updateKey].value,
            record: rec,
          }))
        : chunk.map((rec) => ({
            updateKey: {
              field: updateKey,
              value: rec[updateKey].value as string | number,
            },
            record: rec,
          }));
    const excludeRecords: any[] = [];
    for (const data of formattedRecords) {
      delete data.record[updateKey];
      delete data.record[getRecordNumberFieldCode(appSchema) as string];
      excludeRecords.push(data);
    }

    await client.record.updateRecords({
      app: appId,
      upsert: upsertFlag,
      records: excludeRecords as any[],
    });

    progress.setProgress((CHUNK_SIZE / hookedRecords.length) * 100);
  }
  progress.done();
}

async function upsertRecords(
  hookedRecords: KintoneRecord[],
  updateKey: string,
  appSchema: AppSchema,
  appId: number,
) {
  const excludedFieldCodes = getExcludedFieldCodes(appSchema, [
    "RECORD_NUMBER",
  ]);

  let percent = 0;

  progress.start();
  progress.setProgress(percent);

  for (let i = 0; i < hookedRecords.length; i++) {
    const record = structuredClone(hookedRecords[i]);

    // 更新キーとレコード番号はrecordから除外
    delete record[updateKey];
    delete record[getRecordNumberFieldCode(appSchema) as string];

    const params =
      excludedFieldCodes[0] === updateKey
        ? {
            app: appId,
            id: hookedRecords[i][updateKey].value as string,
            record,
          }
        : {
            app: appId,
            updateKey: {
              field: updateKey,
              value: hookedRecords[i][updateKey].value as string | number,
            },
            record,
          };

    await client.record.upsertRecord(params as any);

    percent = Math.floor(((i + 1) / hookedRecords.length) * 100);
    progress.setProgress(percent);
  }

  progress.done();
}
