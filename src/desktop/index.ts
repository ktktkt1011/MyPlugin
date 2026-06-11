import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import type { KintoneRecord } from "../src/types";
const client = new KintoneRestAPIClient();
(() => {
  "use strict";
  window.csvImportHook = async (records: KintoneRecord[]) => {
    const appId = kintone.app.getId();
    if (!appId) return records;
    const getRecord = await client.record.getAllRecords({
      app: appId,
      orderBy: `数値 desc`,
    });

    let latestNum = getRecord.length ? Number(getRecord[0]["数値"].value) : 0;
    for (const record of records) {
      latestNum = latestNum + 1;
      record["数値"] = { value: String(latestNum).padStart(5, "0") };
    }
    console.log("採番後", records);
    return records;
  };
})();
