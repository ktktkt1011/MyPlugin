/**
 * プラグイン設定値
 */
import type {
  ButtonProps,
  DialogProps,
  AttachmentProps,
} from "kintone-ui-component";
/**
 * CSV import hook 名
 *
 * window.CSV_IMPORT_HOOK
 */
export const HOOK_NAME = "CSV_IMPORT_HOOK" as const;

/**
 * CSV取込イベント名
 */
export const EVENT_NAME = "kintone-csv-import" as const;

/**
 * ボタンID
 */
export const BUTTON_ID = "csv-import-button" as const;

/**
 * ボタン表示名
 */
export const BUTTON_LABEL = "CSV取込" as const;

/**
 * input accept
 */
export const CSV_ACCEPT = ".csv,.txt" as const;

/**
 * kintone API 一括更新上限
 *
 * updateRecords/createRecords
 * 最大100件
 */
export const BATCH_SIZE = 100;

/**
 * CSV文字コード候補
 *
 * Excel想定
 */
export const CSV_ENCODINGS = ["utf-8", "shift-jis", "windows-31j"] as const;

/**
 * import mode
 */
export const IMPORT_MODE = {
  CREATE: "create",
  UPDATE: "update",
  UPSERT: "upsert",
} as const;

/**
 * kintoneフィールドtype
 */
export const FIELD_TYPE = {
  SINGLE_LINE_TEXT: "SINGLE_LINE_TEXT",
  MULTI_LINE_TEXT: "MULTI_LINE_TEXT",
  RICH_TEXT: "RICH_TEXT",

  NUMBER: "NUMBER",

  DATE: "DATE",
  TIME: "TIME",
  DATETIME: "DATETIME",

  DROP_DOWN: "DROP_DOWN",
  RADIO_BUTTON: "RADIO_BUTTON",
  CHECK_BOX: "CHECK_BOX",
  MULTI_SELECT: "MULTI_SELECT",

  USER_SELECT: "USER_SELECT",
  ORGANIZATION_SELECT: "ORGANIZATION_SELECT",
  GROUP_SELECT: "GROUP_SELECT",

  LINK: "LINK",

  FILE: "FILE",

  SUBTABLE: "SUBTABLE",
} as const;

export const BUTTON_CONFIG: {
  CSV_IMPORT_BTN: ButtonProps;
  OK_BTN: ButtonProps;
  CANCEL_BTN: ButtonProps;
} = {
  CSV_IMPORT_BTN: {
    text: "CSV取込",
    type: "normal", // 白にする場合は 'normal'
    id: "csv-import-button",
  },
  OK_BTN: {
    text: "OK", // ボタンに表示するテキスト
    type: "submit", // 'submit' (青) / 'normal' (白) / 'alert' (赤)
    id: "csv-submit-btn", // 独自のHTML id属性
    className: "custom-btn-class", // 独自のCSSクラス
    disabled: false, // 初期状態でクリック可能にするか
  },
  CANCEL_BTN: {
    text: "キャンセル", // ボタンに表示するテキスト
    type: "submit", // 'submit' (青) / 'normal' (白) / 'alert' (赤)
    id: "csv-cancel-btn", // 独自のHTML id属性
    className: "custom-btn-class", // 独自のCSSクラス
    disabled: false, // 初期状態でクリック可能にするか
  },
};

export const ATTACHMENT_CONFIG: { CHOOSE_FILE: AttachmentProps } = {
  CHOOSE_FILE: {
    label: "CSVファイル",
    requiredIcon: true,
    accept: ".csv,.xlsx",
    id: "attachment-option-id",
    files: [],
  },
};

export const DIALOG_CONFIG: {
  DIAlOG_CSV: DialogProps;
  DIALOG_INTAKE: DialogProps;
} = {
  DIAlOG_CSV: {
    title: "CSVファイル選択",
    id: "dialog-option-id",
  },
  DIALOG_INTAKE: {
    title: "取込方法を選択",
  },
};
