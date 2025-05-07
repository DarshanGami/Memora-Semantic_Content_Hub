import React, { useState } from 'react';

const LinkModal = ({ title, setTitle, url, setUrl, description, setDescription, onSaved, onClose }) => {
  const [error, setError] = useState('');

  const handleAdd = async () => {
    try {
      setError('');
      await onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to add link', err);
      setError(err.message || 'Failed to add link. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[rgb(13,148,136)]">Add Link</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-[rgb(13,148,136)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(13,148,136)] focus:border-transparent"
                placeholder="Enter link title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border border-[rgb(13,148,136)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(13,148,136)] focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-[rgb(13,148,136)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(13,148,136)] focus:border-transparent"
                placeholder="Enter link description (optional)"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleAdd} 
              className="px-4 py-2 bg-[rgb(13,148,136)] text-white rounded-lg hover:bg-[rgb(19,78,74)] transition-colors"
            >
              Add Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;