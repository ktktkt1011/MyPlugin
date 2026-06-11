declare global {
  interface Window {
    showOpenFilePicker(options?: {
      multiple?: boolean;
      excludeAcceptAllOption?: boolean;
      types?: {
        description?: string;
        accept: Record<string, string[]>;
      }[];
    }): Promise<FileSystemFileHandle[]>;
  }

  interface FileSystemFileHandle {
    getFile(): Promise<File>;
  }
}

export type CsvData = Record<string, string>;
export type CsvUpdateRecords = Array<
  | {
      id: RecordID;
      record?: RecordForParameter;
      revision?: Revision;
    }
  | {
      updateKey: UpdateKey;
      record?: RecordForParameter;
      revision?: Revision;
    }
>;

// declare global {
//   interface Window {
//     csvImportHook?: (
//       records: Record<string, string>[],
//     ) => Promise<KintoneRecord[]>;
//   }
// }

export {};
