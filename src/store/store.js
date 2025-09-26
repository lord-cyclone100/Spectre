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

const useNewFileModal = create((set) => ({
    isNewFileModalOpen: false,
    setIsNewFileModalOpen: (val) => set({ isNewFileModalOpen: val }),
}))

const useCurrentFilePath = create((set) => ({
  currentFilePath: "",
  setCurrentFilePath: (path) => set({ currentFilePath: path }),
}));

export {useExtension, useEditorValue, useTabFileName, useNewFileModal, useCurrentFilePath}