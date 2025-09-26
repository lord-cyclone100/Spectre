import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { useEditorValue, useExtension, useTabFileName, useNewFileModal } from "../store/store";

export function useMenuTabTaskHandler() {
  const { setFileExtension } = useExtension();
  const { setEditorValue } = useEditorValue();
  const { setTabFileName } = useTabFileName();
  const { setIsNewFileModalOpen } = useNewFileModal();

  const handler = async (name) => {
    if (name === "New") {
      setIsNewFileModalOpen(true);
    }
    if (name === "Open") {
      const file = await open({ multiple: false, directory: false });
      if (file) {
        const content = await readTextFile(file);
        setEditorValue(content);
        const fileName = file.split("\\");
        const fileExtension = fileName[fileName.length - 1].split(".")[1];
        setTabFileName(fileName[fileName.length - 1]);
        setFileExtension(fileExtension);
      }
    }
  };

  return handler;
}