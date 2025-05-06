import React, { useState } from 'react';
import api from '../services/api';

const FileUploadModal = ({ onClose, onUploaded }) => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/files/upload', formData);
      onUploaded(res.data);
      onClose();
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-semibold mb-4">Upload File</h2>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full mb-4" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={handleUpload} className="px-4 py-2 bg-blue-600 text-white rounded">Upload</button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;