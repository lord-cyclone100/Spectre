import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useEditorValue, useExtension, useTabFileName, useNewFileModal, useCurrentFilePath, useOpenFiles } from "../store/store";

export function useMenuTabTaskHandler() {
  const { setFileExtension } = useExtension();
  const { editorValue, setEditorValue } = useEditorValue();
  const { tabFileName, setTabFileName } = useTabFileName();
  const { setIsNewFileModalOpen } = useNewFileModal();
  const { currentFilePath, setCurrentFilePath } = useCurrentFilePath();
  const { addOrUpdateFile, getActiveFile, updateFileContent, setActiveFile } = useOpenFiles();

  const handler = async (name) => {
    if (name === "New") {
      setIsNewFileModalOpen(true);
      // Don't clear currentFilePath here, let the modal handle it
    }
    if (name === "Open") {
      const file = await open({ multiple: false, directory: false });
      if (file) {
        const content = await readTextFile(file);
        const fileName = file.split("\\");
        const fileExtension = fileName[fileName.length - 1].split(".")[1];
        const fullFileName = fileName[fileName.length - 1];
        
        // Create a unique ID for this file (using path as ID)
        const fileId = file;
        
        // Add file to the multi-tab system
        addOrUpdateFile({
          id: fileId,
          name: fullFileName,
          content: content,
          path: file,
          extension: fileExtension
        });
        
        // Update legacy state for backward compatibility
        setEditorValue(content);
        setTabFileName(fullFileName);
        setFileExtension(fileExtension);
        setCurrentFilePath(file);
      }
    }
    if (name === "Save") {
      const activeFile = getActiveFile();
      let filePathToSave = activeFile?.path || currentFilePath;
      let contentToSave = activeFile?.content || editorValue;
      
      // If no file path (new file), show save dialog
      if (!filePathToSave) {
        const defaultFileName = activeFile?.name || tabFileName || "untitled.txt";
        filePathToSave = await save({
          title: "Save File",
          defaultPath: defaultFileName,
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
        
        // Extract file info
        const fileName = filePathToSave.split("\\");
        const fileExtension = fileName[fileName.length - 1].split(".")[1];
        const fullFileName = fileName[fileName.length - 1];
        
        // If this was a new file, update it with the saved path
        if (activeFile && !activeFile.path) {
          addOrUpdateFile({
            ...activeFile,
            path: filePathToSave,
            name: fullFileName,
            extension: fileExtension
          });
        } else {
          // Create new file entry
          const fileId = filePathToSave;
          addOrUpdateFile({
            id: fileId,
            name: fullFileName,
            content: contentToSave,
            path: filePathToSave,
            extension: fileExtension
          });
        }
        
        // Update legacy state for backward compatibility
        setCurrentFilePath(filePathToSave);
        setTabFileName(fullFileName);
        setFileExtension(fileExtension);
      }
      
      // Save the file
      try {
        console.log("Saving file:", filePathToSave);
        console.log("Content to save:", contentToSave);
        await writeTextFile(filePathToSave, contentToSave);
        console.log("File saved successfully!");
        alert("File saved successfully!");
        
        // Update the file content in the store
        if (activeFile) {
          updateFileContent(activeFile.id, contentToSave);
        }
      } catch (error) {
        console.error("Error saving file:", error);
        alert("Error saving file: " + error.message);
      }
    }
  };

  return handler;
}