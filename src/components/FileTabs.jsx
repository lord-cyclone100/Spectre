import { useOpenFiles } from "../store/store";
import { useEditorValue } from "../store/store";

export const FileTabs = () => {
  const { openFiles, activeFileId, setActiveFile, removeFile } = useOpenFiles();
  const { editorValue, setEditorValue } = useEditorValue()

  const handleTabClick = (fileId) => {
    setActiveFile(fileId);
  };

  const handleCloseTab = (e, fileId) => {
    e.stopPropagation(); // Prevent tab selection when closing
    removeFile(fileId);
  };

  if (openFiles.length === 0) {
    return (
      <div className="h-[4vh] flex items-center px-3 bg-[#0f0f1e] border-b border-[#4a9eff]/30">
        {/* Empty tab bar */}
      </div>
    );
  }

  return (
    <div className="h-[4vh] flex items-center overflow-x-auto bg-[#0f0f1e] border-b border-[#4a9eff]/30">
      {openFiles.map((file) => (
        <div
          key={file.id}
          className={`flex items-center gap-2 px-4 py-2 cursor-pointer min-w-max border-r border-[#4a9eff]/20 transition-colors ${
            activeFileId === file.id 
              ? 'bg-[#0a0a0f] text-[#4a9eff] border-b-2 border-b-[#4a9eff]' 
              : 'bg-[#0f0f1e] text-[#6bb6ff] hover:bg-[#4a9eff]/10'
          }`}
          onClick={() => handleTabClick(file.id)}
        >
          <span className="text-sm">{file.name}</span>
          <button
            className="text-base hover:bg-[#4a9eff]/20 rounded w-5 h-5 flex items-center justify-center transition-colors"
            onClick={(e) => handleCloseTab(e, file.id)}
            title="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};