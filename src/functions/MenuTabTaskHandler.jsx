import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { useEditorValue, useExtension, useTabFileName } from "../store/store";

export const MenuTabTaskHandler = (name) => {
  const { fileExtension, setFileExtension } = useExtension()
  const { editorValue, setEditorValue } = useEditorValue()
  const { tabFileName, setTabFileName } = useTabFileName()
  // const taskMap = {
  //   New:() => alert("New triggered"),
  //   Open:() => alert("Open triggered"),
  // }
  const handleNew = () => {
    alert("New triggered")
  }

  const handleOpen = async() => {
    const file = await open({
      multiple: false,
      directory: false,
    });
    if (file) {
      // Read file content using Tauri's FS API
      const content = await readTextFile(file);
      setEditorValue(content);
    }
    const fileName = file.split('\\')
    const fileExtension = fileName[fileName.length -1].split('.')[1]
    setTabFileName(fileName[fileName.length -1])
    setFileExtension(fileExtension)
  }

  const taskMap = {
    New: handleNew,
    Open:handleOpen,
  }
  const taskFn = taskMap[name]

  if(taskFn && typeof taskFn === 'function'){
    taskFn()
  }
  else{
    console.warn('Error!!!!');
  }
}

// export {handleNew,handleOpen}