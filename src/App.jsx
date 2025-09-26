import { Editor } from "@monaco-editor/react";
import * as monaco from 'monaco-editor'
import "./App.css";
import { useState, useRef, useEffect } from "react";
import { tabs } from "./api/tabs";
import { MenuTab } from "./components/MenuTab";
import { useEditorValue, useExtension, useTabFileName } from "./store/store";

export const App = () => {
  const [sideBarWidth, setSideBarWidth] = useState(16);
  const { fileExtension, setFileExtension } = useExtension()
  const { editorValue, setEditorValue } = useEditorValue()
  const { tabFileName, setTabFileName } = useTabFileName()
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

  return (
   <>
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
        
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 h-full w-1 cursor-ew-resize hover:w-2 bg-black/10 hover:bg-black/20 transition-all duration-150"
        />
      </div>
      <div style={{ width: `${100 - sideBarWidth}vw` }}className="bg-rose-400">
        <div className="h-[4vh]">{tabFileName}</div>
        <Editor height="96vh"
          width="100%"
      
          language={getLanguageByExtension(fileExtension)}
          value={editorValue}
          
          theme="vs-dark"
          options={{
            fontSize:16,
            fontFamily: "Urbanist",
            smoothScrolling:true
          }}
        />
      </div>

    </div>
   </div>
   </> 
  )
}
