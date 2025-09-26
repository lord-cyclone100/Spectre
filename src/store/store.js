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

export {useExtension, useEditorValue, useTabFileName}