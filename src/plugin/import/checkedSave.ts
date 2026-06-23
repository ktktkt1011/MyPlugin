import { Dialog, RadioButton, Button, Dropdown } from "kintone-ui-component";
import { IMPORT_MODE, DIALOG_CONFIG, BUTTON_CONFIG } from "../config";
import type { FieldInfo } from "../types";

export function checkedSave(schema: any): Promise<{
  saveWay: string;
  updateKey: string;
}> {
  return new Promise((resolve) => {
    const content = document.createElement("div");

    const dialog = new Dialog({ title: "取込方法を選択", content });

    const options = [
      { label: "作成", value: IMPORT_MODE.CREATE },
      { label: "更新", value: IMPORT_MODE.UPDATE },
      { label: "更新または作成", value: IMPORT_MODE.UPSERT },
    ];

    let selected: string = IMPORT_MODE.CREATE;

    const wrapper = document.createElement("label");

    const radio = new RadioButton({
      label: "取込方法", // ラジオボタンの上部に表示されるラベル
      // 選択肢の配列（label: 画面表示名, value: 内部的な値）
      items: options,
      value: selected, // 初期選択値
      requiredIcon: true, // 必須マーク（*）を表示するかどうか
      className: "custom-radio-class", // 必要に応じてCSSクラスを指定
    });

    const footer = document.createElement("div");

    const okBtn = new Button({
      text: "OK", // ボタンに表示するテキスト
      type: "submit", // 'submit' (青) / 'normal' (白) / 'alert' (赤)
      id: "csv-submit-btn", // 独自のHTML id属性
      className: "custom-btn-class", // 独自のCSSクラス
      disabled: false, // 初期状態でクリック可能にするか
    });
    okBtn.onclick = () => {
      if (
        (selected === IMPORT_MODE.UPDATE || selected === IMPORT_MODE.UPSERT) &&
        !selectedUpdateKey
      ) {
        alert("更新キーを選択してください。");
        return;
      }

      dialog.close();

      resolve({
        saveWay: selected,
        updateKey: selectedUpdateKey,
      });
    };

    const cancelBtn = new Button({
      text: "キャンセル", // ボタンに表示するテキスト
      type: "submit", // 'submit' (青) / 'normal' (白) / 'alert' (赤)
      id: "csv-cancel-btn", // 独自のHTML id属性
      className: "custom-btn-class", // 独自のCSSクラス
      disabled: false, // 初期状態でクリック可能にするか
    });

    cancelBtn.onclick = () => {
      dialog.close();
      resolve({
        saveWay: "",
        updateKey: "",
      });
    };
    const uniqueFields = Object.values(schema.fields) as FieldInfo[];
    const updateKeyOptions = uniqueFields
      .filter((field) => field.unique)
      .map((field) => ({
        label: field.label,
        value: field.code,
      }));
    updateKeyOptions.push(
      ...uniqueFields
        .filter((field) => field.type === "RECORD_NUMBER")
        .map((field) => ({
          label: field.label,
          value: field.code,
        })),
    );

    let selectedUpdateKey = "";

    const dropdown = new Dropdown({
      label: "更新キー",
      items: updateKeyOptions,
      value: "----",
    });

    dropdown.addEventListener("change", (event: Event): void => {
      const customEvent = event as CustomEvent<{
        value: string;
      }>;

      selectedUpdateKey = customEvent.detail.value;
    });

    const upDateKey = document.createElement("div");
    upDateKey.style.display = "none";

    radio.addEventListener("change", (customEvent: any) => {
      if (
        customEvent.detail.value === IMPORT_MODE.UPDATE ||
        customEvent.detail.value === IMPORT_MODE.UPSERT
      ) {
        upDateKey.style.display = "block";
      } else {
        upDateKey.style.display = "none";
      }
      selected = customEvent.detail.value;
    });
    wrapper.appendChild(radio);

    content.appendChild(wrapper);
    footer.appendChild(okBtn);
    footer.appendChild(cancelBtn);
    upDateKey.appendChild(dropdown);
    content.appendChild(upDateKey);
    content.appendChild(footer);

    dialog.open();
  });
}
