import { useOpenFiles } from "../store/store";

export const FileTabs = () => {
  const { openFiles, activeFileId, setActiveFile, removeFile } = useOpenFiles();

  const handleTabClick = (fileId) => {
    setActiveFile(fileId);
  };

  const handleCloseTab = (e, fileId) => {
    e.stopPropagation(); // Prevent tab selection when closing
    removeFile(fileId);
  };

  if (openFiles.length === 0) {
    return (
      <div className="h-[4vh] flex items-center px-3 text-gray-600">
        No files open
      </div>
    );
  }

  return (
    <div className="h-[4vh] flex items-center overflow-x-auto">
      {openFiles.map((file) => (
        <div
          key={file.id}
          className={`flex items-center px-3 py-1 mx-1 rounded-t-md cursor-pointer min-w-max border-b-2 ${
            activeFileId === file.id 
              ? 'bg-white/20 border-white text-white' 
              : 'bg-white/10 border-transparent text-gray-200 hover:bg-white/15'
          }`}
          onClick={() => handleTabClick(file.id)}
        >
          <span className="text-sm mr-2">{file.name}</span>
          <button
            className="text-xs hover:bg-white/20 rounded px-1"
            onClick={(e) => handleCloseTab(e, file.id)}
            title="Close tab"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};