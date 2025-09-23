import { Editor } from "@monaco-editor/react";
import "./App.css";

export const App = () => {
  return (
   <>
    <Editor height="100vh" defaultLanguage="javascript" defaultValue="dfsdf" theme="vs-dark" />
   </> 
  )
}
