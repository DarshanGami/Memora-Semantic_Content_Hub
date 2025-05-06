import React, { useState } from 'react';
import api from '../services/api';

const LinkModal = ({ onClose, onSaved }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const handleSave = async () => {
    try {
      const res = await api.post('/links', { title, url });
      onSaved(res.data);
      onClose();
    } catch (err) {
      console.error('Link save failed', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-semibold mb-4">Save Bookmark</h2>
        <input
          type="text"
          placeholder="Link title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="url"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;