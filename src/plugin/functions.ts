const EVENT_NAME = "csv-import-plugin.success";
import { KintoneRestAPIClient } from "@kintone/rest-api-client";
import { Spinner, Button, Attachment } from "kintone-ui-component";
import { parseCsv } from "./csv/parseCsv";
import { readCsv } from "./csv/readCsv";
import { getAppSchema } from "./schema/getAppSchema";
import { convertRecords } from "./convert/convertRecord";
import { validateRecords } from "./validate/validateRecord";
import { runHook } from "./hook/runHook";
import { checkedSave } from "./validate/checkedSave";
import { importCsvFile } from "./save/importCsvFile";
import { selectCsvFile } from "./import/selectCsvFile";
import { BUTTON_CONFIG } from "./config";
import Swal from "sweetalert2";

const spinner = new Spinner({
  text: "now loading...",
  className: "options-class",
  id: "options-id",
  container: document.body,
});

const client = new KintoneRestAPIClient({});

/**
 * CSVをJSON配列へ変換、1行目をヘッダーとして扱う
 * @param csvText CSV文字列
 * @returns オブジェクト配列
 */
export const FUNCTIONS = {
  /**
   * ボタン生成
   */
  createButton(): void {
    if (document.getElementById("csv-import-button")) return;

    // KUCのButtonインスタンスを作成
    const csvImportButton = new Button(BUTTON_CONFIG.CSV_IMPORT_BTN);

    csvImportButton.addEventListener("click", async () => {
      try {
        spinner.open();
        const file = await selectCsvFile();

        if (!file) {
          spinner.close();
          return;
        }

        /* アプリIDが存在しない場合、処理を終了する */
        const appId = kintone.app.getId();
        if (!appId) return;

        // 1. アプリ定義取得
        const appSchema = await getAppSchema(appId);

        // 2. 保存方法設定
        const { saveWay, updateKey } = await checkedSave(appSchema);

        if (!saveWay || !updateKey) {
          if (!saveWay) {
            spinner.close();
            return;
          }
        }

        // 3. CSV読込
        const csvText = await readCsv(file);

        // 4. CSV解析
        const csvRecords = parseCsv(csvText);

        // 5. CSV → kintone record変換
        const records = convertRecords(csvRecords, appSchema);

        // 6. バリデーション
        validateRecords(records, appSchema);

        // 7. hook
        const hookedRecords = await runHook(records);

        // 8. 再検証
        validateRecords(hookedRecords, appSchema);

        // 9. レコード作成、更新処理
        await importCsvFile(hookedRecords, saveWay, updateKey, appSchema);
        spinner.close();
        window.location.reload();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await Swal.fire({
          title: "エラー",
          icon: "error",
          text: message,
        });
      }
    });

    // kintoneのメニュー上部などのスペースを取得して配置
    const space = kintone.app.getHeaderMenuSpaceElement(); // または getSpaceElement('要素ID')
    if (space) {
      space.appendChild(csvImportButton);
    }
  },
};
