export const EmptyEditor = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f] text-[#4a9eff]">
      <div className="text-center space-y-4">
        <svg
          className="w-20 h-20 mx-auto mb-6 opacity-60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h2 className="text-xl font-medium text-[#4a9eff]">No File Open</h2>
        <p className="text-sm text-[#6bb6ff] max-w-md">
          Open a file from the explorer or create a new one to start editing
        </p>
        <div className="flex gap-3 justify-center mt-6 text-xs text-[#5aa7f5]">
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-[#0f0f1e] rounded border border-[#4a9eff]/30">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-[#0f0f1e] rounded border border-[#4a9eff]/30">N</kbd>
            <span className="ml-2">New File</span>
          </div>
        </div>
      </div>
    </div>
  );
};