import { Editor } from "@monaco-editor/react";
import * as monaco from 'monaco-editor'
import "./App.css";
import { useState, useRef, useEffect } from "react";
import { tabs } from "./api/tabs";
import { MenuTab } from "./components/MenuTab";
import { NewFileModal } from "./components/NewFileModal";
import { FileTabs } from "./components/FileTabs";
import { useEditorValue, useExtension, useTabFileName, useNewFileModal, useOpenFiles, useTerminal } from "./store/store";
import { FileTree } from "./components/FileTree";
import { Terminal } from "./components/Terminal";
import { EmptyEditor } from "./components/EmptyEditor";

export const App = () => {
  const [sideBarWidth, setSideBarWidth] = useState(16);
  const { fileExtension, setFileExtension } = useExtension()
  const { editorValue, setEditorValue } = useEditorValue()
  const { tabFileName, setTabFileName } = useTabFileName()
  const { isNewFileModalOpen, setIsNewFileModalOpen } = useNewFileModal()
  const { openFiles, activeFileId, getActiveFile, updateFileContent } = useOpenFiles()
  const { isTerminalVisible } = useTerminal()
  const dragging = useRef(false);

  const languages = monaco.languages.getLanguages();

  const extensionsByLanguage = languages.map(lang => ({
    id: lang.id,
    extensions: lang.extensions || []
  }));

  console.log(extensionsByLanguage);

  const handleMouseDown = () => {
    dragging.current = true;
    document.body.style.cursor = "ew-resize";
  };

  const handleMouseUp = () => {
    dragging.current = false;
    document.body.style.cursor = "";
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    // Calculate new width in vw
    const newWidth = (e.clientX / window.innerWidth) * 100;
    // Clamp between 10vw and 60vw
    setSideBarWidth(Math.min(Math.max(newWidth, 10), 60));
  };

  // Sync active file with editor
  useEffect(() => {
    const activeFile = getActiveFile();
    if (activeFile) {
      setEditorValue(activeFile.content);
      setTabFileName(activeFile.name);
      setFileExtension(activeFile.extension);
    }
  }, [activeFileId, getActiveFile, setEditorValue, setTabFileName, setFileExtension]);

  // Handle editor content changes
  const handleEditorChange = (value) => {
    const newValue = value || '';
    setEditorValue(newValue);
    
    // Update the active file's content in the store
    const activeFile = getActiveFile();
    if (activeFile) {
      updateFileContent(activeFile.id, newValue);
    }
  };

  // Attach/remove listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  });

  const getLanguageByExtension = (ext) => {
  // Find the language whose extensions include the given extension
  const lang = languages.find(lang =>
    (lang.extensions || []).some(e => e.replace('.', '') === ext)
  );
  return lang ? lang.id : "plaintext";
};

  const handleModalClose = () => {
    setIsNewFileModalOpen(false);
  };

  const handleModalConfirm = (fileName) => {
    setIsNewFileModalOpen(false);
    // Additional logic can be added here if needed
  };

  return (
   <>
   <NewFileModal 
     isOpen={isNewFileModalOpen}
     onClose={handleModalClose}
     onConfirm={handleModalConfirm}
   />
   <div className="flex flex-col">
    <div className="h-[2.8vh] flex bg-emerald-400 items-center">
      {
        tabs.map((tabname)=>(
          // <button className="btn btn-info h-[100%]">{tabname}</button>
          <MenuTab tabname={tabname.name} menu={tabname.submenu}/>
        ))
      }
    </div>
    <div className="flex h-[97.2vh]">
      <div style={{ width: `${sideBarWidth}vw` }} className="bg-amber-400 relative">
        
        {/* <button className="btn" onClick={handleClick}>Open</button> */}
        <FileTree />
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 h-full w-1 cursor-ew-resize hover:w-2 bg-black/10 hover:bg-black/20 transition-all duration-150"
        />
      </div>
      <div style={{ width: `${100 - sideBarWidth}vw` }} className="bg-rose-400 flex flex-col relative">
        <FileTabs />
        <div className="flex-1 flex flex-col">
          {openFiles.length === 0 ? (
            <EmptyEditor />
          ):(
            <Editor 
              height="93.4vh"
              width="100%"
              language={getLanguageByExtension(fileExtension)}
              value={editorValue}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize:16,
                fontFamily: "Urbanist",
                smoothScrolling:true
              }}
            />
          )}
          <Terminal />
        </div>
      </div>
    </div>
   </div>
   </> 
  )
}
