import { Editor } from "@monaco-editor/react";
import "./App.css";
import { useState, useRef, useEffect } from "react";

export const App = () => {
  const [sideBarWidth, setSideBarWidth] = useState(16);
  const dragging = useRef(false);

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

  return (
   <>
   <div className="flex flex-col">
    <div className="h-[2.8vh]"></div>
    <div className="flex h-[97.2vh]">
      <div style={{ width: `${sideBarWidth}vw` }} className="bg-amber-400 relative">
        {/* Sidebar content goes here */}
        
        {/* Draggable resize handle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 h-full w-1 cursor-ew-resize hover:w-2 bg-black/10 hover:bg-black/20 transition-all duration-150"
        />
      </div>
      <div style={{ width: `${100 - sideBarWidth}vw` }}className="bg-rose-400">
        <Editor height="100%"
          width="100%"
          defaultLanguage="javascript"
          defaultValue="dfsdf"
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
