export const EmptyEditor = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-gray-400">
      <div className="text-center">
        <svg
          className="w-24 h-24 mx-auto mb-4 opacity-50"
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
        <h2 className="text-2xl font-semibold mb-2">No File Open</h2>
        <p className="text-sm">Open a file from the file tree or create a new one to get started</p>
      </div>
    </div>
  );
};