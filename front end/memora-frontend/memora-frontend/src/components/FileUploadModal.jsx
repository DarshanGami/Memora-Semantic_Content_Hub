import React, { useState } from 'react';

const FileUploadModal = ({ onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    setError('');
    if (!file) {
      setError('Please select a file before uploading.');
      return;
    }
    await onUploaded(file);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[rgb(13,148,136)]">Upload File</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-4">
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])} 
              className="w-full p-2 border border-[rgb(13,148,136)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(13,148,136)] focus:border-transparent"
            />
          </div>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-2">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload} 
              className="px-4 py-2 bg-[rgb(13,148,136)] text-white rounded-lg hover:bg-[rgb(19,78,74)] transition-colors"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;