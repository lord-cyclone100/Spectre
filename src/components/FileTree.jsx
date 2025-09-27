import { useFolderStructure, useOpenFiles, useEditorValue, useTabFileName, useExtension, useCurrentFilePath } from "../store/store";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="h-4 w-4">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

const FolderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="h-4 w-4">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
    />
  </svg>
);

const FileTreeItem = ({ item, onFileClick }) => {
  const [children, setChildren] = useState(item.children || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFileClick = async () => {
    if (!item.is_directory) {
      await onFileClick(item);
    }
  };

  const handleDirectoryExpand = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);
    
    // If children haven't been loaded yet, load them
    if (children.length === 0 && !isLoading) {
      setIsLoading(true);
      try {
        console.log("Loading children for:", item.path);
        const subdirectoryContents = await invoke("read_subdirectory", { dirPath: item.path });
        setChildren(subdirectoryContents);
        console.log("Loaded", subdirectoryContents.length, "children for", item.name);
      } catch (error) {
        console.error("Error loading subdirectory:", error);
        setChildren([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (item.is_directory) {
    // Directory - show as collapsible with lazy loading
    return (
      <li className="w-full">
        <div className="w-full">
          <div 
            onClick={handleDirectoryExpand}
            className="flex items-center gap-2 p-2 hover:bg-base-300 cursor-pointer rounded"
          >
            <div className="flex items-center gap-1">
              {/* Expand/collapse arrow */}
              <span className={`transition-transform duration-200 text-xs ${isExpanded ? 'rotate-90' : ''}`}>
                {'>'}
              </span>
              <FolderIcon />
            </div>
            <span className="text-sm">{item.name}</span>
            {isLoading && <span className="text-xs text-gray-500 ml-2">Loading...</span>}
          </div>
          
          {isExpanded && (
            <div className="ml-4 border-l border-base-300 pl-2">
              <ul className="space-y-1">
                {children.map((child, index) => (
                  <FileTreeItem key={`${child.path}-${index}`} item={child} onFileClick={onFileClick} />
                ))}
                {children.length === 0 && !isLoading && (
                  <li className="text-xs text-gray-500 p-2">Empty folder</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </li>
    );
  } else {
    // File - show as clickable item
    return (
      <li className="w-full">
        <a 
          onClick={handleFileClick} 
          className="flex items-center gap-2 p-2 hover:bg-base-300 cursor-pointer rounded text-sm"
        >
          <FileIcon />
          <span>{item.name}</span>
        </a>
      </li>
    );
  }
};

export const FileTree = () => {
  const { folderStructure, currentFolderPath } = useFolderStructure();
  const { addOrUpdateFile } = useOpenFiles();
  const { setEditorValue } = useEditorValue();
  const { setTabFileName } = useTabFileName();
  const { setFileExtension } = useExtension();
  const { setCurrentFilePath } = useCurrentFilePath();

  const handleFileClick = async (fileItem) => {
    try {
      console.log("Attempting to read file:", fileItem.path);
      
      // Normalize the file path for cross-platform compatibility
      const normalizedPath = fileItem.path.replace(/\\/g, '/');
      console.log("Normalized path:", normalizedPath);
      
      // Read file content using our custom Rust command
      const content = await invoke("test_read_file", { filePath: fileItem.path });
      
      // Extract file info
      const fileName = fileItem.name;
      const fileExtension = fileName.split('.').pop() || '';
      
      // Add file to the multi-tab system
      addOrUpdateFile({
        id: fileItem.path,
        name: fileName,
        content: content,
        path: fileItem.path,
        extension: fileExtension
      });
      
      // Update legacy state for backward compatibility
      setEditorValue(content);
      setTabFileName(fileName);
      setFileExtension(fileExtension);
      setCurrentFilePath(fileItem.path);
      
      console.log("File opened successfully:", fileName);
    } catch (error) {
      console.error("Error reading file:", error);
      console.error("File path that failed:", fileItem.path);
      console.error("Full error object:", error);
      alert("Error opening file: " + error.message || error);
    }
  };

  if (!folderStructure || folderStructure.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <FolderIcon />
          <p className="mt-2 text-sm">No folder opened</p>
          <p className="text-xs">Use File → Open Folder to browse files</p>
        </div>
      </div>
    );
  }

  // Get folder name from path
  const folderName = currentFolderPath.split(/[/\\]/).pop() || "Folder";

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 bg-base-300 text-sm font-semibold border-b flex items-center gap-2">
        <FolderIcon />
        <span>{folderName}</span>
      </div>
      <div className="flex-1 bg-base-200 overflow-y-auto">
        <ul className="p-2 space-y-1">
          {folderStructure.map((item, index) => (
            <FileTreeItem key={index} item={item} onFileClick={handleFileClick} />
          ))}
        </ul>
      </div>
    </div>
  );
};