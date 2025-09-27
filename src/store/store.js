import { create } from "zustand";

const useExtension = create((set) => ({
    fileExtension: "",
    setFileExtension: (val) => set({ fileExtension: val }),
}))

const useEditorValue = create((set) => ({
    editorValue: "",
    setEditorValue: (val) => set({ editorValue: val }),
}))

const useTabFileName = create((set) => ({
    tabFileName: "",
    setTabFileName: (val) => set({ tabFileName: val }),
}))

const useDirectoryName = create((set) => ({
    directoryName: "",
    setDirectoryName: (val) => set({ directoryName: val }),
}))

const useNewFileModal = create((set) => ({
    isNewFileModalOpen: false,
    setIsNewFileModalOpen: (val) => set({ isNewFileModalOpen: val }),
}))

const useCurrentFilePath = create((set) => ({
  currentFilePath: "",
  setCurrentFilePath: (path) => set({ currentFilePath: path }),
}));

// New multi-tab store
const useOpenFiles = create((set, get) => ({
  openFiles: [], // Array of {id, name, content, path, extension}
  activeFileId: null,
  
  // Add or update a file
  addOrUpdateFile: (file) => set((state) => {
    const existingIndex = state.openFiles.findIndex(f => f.id === file.id);
    if (existingIndex >= 0) {
      // Update existing file
      const updatedFiles = [...state.openFiles];
      updatedFiles[existingIndex] = { ...updatedFiles[existingIndex], ...file };
      return { openFiles: updatedFiles };
    } else {
      // Add new file
      return { 
        openFiles: [...state.openFiles, file],
        activeFileId: file.id
      };
    }
  }),
  
  // Remove a file
  removeFile: (fileId) => set((state) => {
    const newFiles = state.openFiles.filter(f => f.id !== fileId);
    let newActiveId = state.activeFileId;
    
    // If we're removing the active file, switch to another one
    if (state.activeFileId === fileId) {
      if (newFiles.length > 0) {
        // Switch to the last file in the list
        newActiveId = newFiles[newFiles.length - 1].id;
      } else {
        newActiveId = null;
      }
    }
    
    return { 
      openFiles: newFiles,
      activeFileId: newActiveId
    };
  }),
  
  // Set active file
  setActiveFile: (fileId) => set({ activeFileId: fileId }),
  
  // Get active file
  getActiveFile: () => {
    const state = get();
    return state.openFiles.find(f => f.id === state.activeFileId) || null;
  },
  
  // Update file content
  updateFileContent: (fileId, content) => set((state) => {
    const updatedFiles = state.openFiles.map(file => 
      file.id === fileId ? { ...file, content } : file
    );
    return { openFiles: updatedFiles };
  })
}));

// Folder structure store
const useFolderStructure = create((set) => ({
  folderStructure: null,
  currentFolderPath: "",
  setFolderStructure: (structure) => set({ folderStructure: structure }),
  setCurrentFolderPath: (path) => set({ currentFolderPath: path }),
  clearFolderStructure: () => set({ folderStructure: null, currentFolderPath: "" }),
}));

export {useExtension, useEditorValue, useTabFileName, useDirectoryName, useNewFileModal, useCurrentFilePath, useOpenFiles, useFolderStructure}