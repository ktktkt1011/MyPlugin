import { Dialog, Button, Attachment } from "kintone-ui-component";
import { BUTTON_CONFIG, ATTACHMENT_CONFIG, DIALOG_CONFIG } from "../config";

export function selectCsvFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const content = document.createElement("div");

    /* 選択ファイル */
    let selectedFile: File | null = null;

    /* ダイアログ */
    const dialog = new Dialog({
      title: "CSVファイル選択",
      id: "dialog-option-id",
      content,
    });

    /* ファイル選択 */
    const attachment = new Attachment({
      label: "CSVファイル",
      requiredIcon: true,
      accept: ".csv,.xlsx",
      id: "attachment-option-id",
      files: [],
    });

    /* ファイル変更 */
    attachment.addEventListener("change", (event: Event) => {
      const customEvent = event as CustomEvent<{
        files: File[];
      }>;

      const files = customEvent.detail.files;

      selectedFile = files?.[0] ?? null;

      /**
       * CSV以外チェック
       */
      if (selectedFile && !selectedFile.name.toLowerCase().endsWith(".csv")) {
        attachment.error = "CSVファイルを選択してください";
        selectedFile = null;
        return;
      }

      attachment.error = "";
    });

    content.appendChild(attachment);

    /**
     * footer
     */
    const footer = document.createElement("div");
    footer.style.display = "flex";
    footer.style.justifyContent = "flex-end";
    footer.style.gap = "8px";
    footer.style.marginTop = "16px";

    /**
     * OKボタン
     */
    const okButton = new Button({
      text: "OK", // ボタンに表示するテキスト
      type: "submit", // 'submit' (青) / 'normal' (白) / 'alert' (赤)
      id: "csv-submit-btn", // 独自のHTML id属性
      className: "custom-btn-class", // 独自のCSSクラス
      disabled: false, // 初期状態でクリック可能にするか
    });

    /**
     * キャンセル
     */
    const cancelButton = new Button({
      text: "キャンセル", // ボタンに表示するテキスト
      type: "submit", // 'submit' (青) / 'normal' (白) / 'alert' (赤)
      id: "csv-cancel-btn", // 独自のHTML id属性
      className: "csv-import-dialog", // 独自のCSSクラス
      disabled: false, // 初期状態でクリック可能にするか
    });

    let isResolved: boolean = false;
    okButton.onclick = () => {
      isResolved = true;
      if (!selectedFile) {
        attachment.error = "CSVファイルを選択してください";
        return;
      }

      dialog.close();
      resolve(selectedFile);
    };

    cancelButton.onclick = () => {
      isResolved = false;
      dialog.close();
      resolve(null);
    };

    /**
     * ダイアログ閉じる
     * (×押下対応)
     */
    dialog.addEventListener("close", () => {
      if (isResolved) resolve(selectedFile);
      resolve(null);
    });
    footer.appendChild(okButton);
    footer.appendChild(cancelButton);

    content.appendChild(footer);

    dialog.open();
  });
}
