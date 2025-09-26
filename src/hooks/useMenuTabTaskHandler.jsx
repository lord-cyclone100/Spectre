import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useEditorValue, useExtension, useTabFileName, useNewFileModal, useCurrentFilePath } from "../store/store";

export function useMenuTabTaskHandler() {
  const { setFileExtension } = useExtension();
  const { editorValue, setEditorValue } = useEditorValue();
  const { setTabFileName } = useTabFileName();
  const { setIsNewFileModalOpen } = useNewFileModal();
  const { currentFilePath, setCurrentFilePath } = useCurrentFilePath();

  const handler = async (name) => {
    if (name === "New") {
      setIsNewFileModalOpen(true);
      setCurrentFilePath("");
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
        setCurrentFilePath(file);
      }
    }
    if (name === "Save") {
      let filePathToSave = currentFilePath;
      
      // If no current file path (new file), show save dialog
      if (!currentFilePath) {
        filePathToSave = await save({
          title: "Save File",
          filters: [
            {
              name: "All Files",
              extensions: ["*"]
            },
            {
              name: "Text Files",
              extensions: ["txt", "md", "js", "jsx", "ts", "tsx", "html", "css", "json"]
            }
          ]
        });
        
        // If user canceled the save dialog, return early
        if (!filePathToSave) {
          return;
        }
        
        // Update the current file path and tab name
        setCurrentFilePath(filePathToSave);
        const fileName = filePathToSave.split("\\");
        const fileExtension = fileName[fileName.length - 1].split(".")[1];
        setTabFileName(fileName[fileName.length - 1]);
        setFileExtension(fileExtension);
      }
      
      // Save the file
      try {
        console.log("Saving file:", filePathToSave);
        console.log("Content to save:", editorValue);
        await writeTextFile(filePathToSave, editorValue);
        console.log("File saved successfully!");
        alert("File saved successfully!");
      } catch (error) {
        console.error("Error saving file:", error);
        alert("Error saving file: " + error.message);
      }
    }
  };

  return handler;
}