import { useState } from "react";
import { useEditorValue, useExtension, useTabFileName } from "../store/store";

export const NewFileModal = ({ isOpen, onClose, onConfirm }) => {
  const [fileName, setFileName] = useState("");
  const { setFileExtension } = useExtension();
  const { setEditorValue } = useEditorValue();
  const { setTabFileName } = useTabFileName();

  const handleCreate = () => {
    if (fileName.trim() && hasValidExtension(fileName)) {
      // Extract file extension
      const parts = fileName.split('.');
      const extension = parts.length > 1 ? parts[parts.length - 1] : '';
      
      // Update store values
      setTabFileName(fileName);
      setFileExtension(extension);
      
      // Set blank content for new file
      setEditorValue('');
      
      // Close modal and reset
      setFileName("");
      onConfirm(fileName);
    }
  };

  const handleCancel = () => {
    setFileName("");
    onClose();
  };

  const hasValidExtension = (filename) => {
    const parts = filename.trim().split('.');
    return parts.length > 1 && parts[parts.length - 1].length > 0;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal backdrop */}
      <div className="modal modal-open">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Create New File</h3>
          
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">File Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter file name (e.g., app.js, style.css)"
              className="input input-bordered w-full"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && fileName.trim() && hasValidExtension(fileName)) {
                  handleCreate();
                } else if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
              autoFocus
            />
          </div>
          
          <div className="modal-action">
            <button 
              className="btn btn-ghost" 
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleCreate}
              disabled={!fileName.trim() || !hasValidExtension(fileName)}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  );
};