import React, { useEffect, useState } from 'react';

export default function ProfileModal({ isOpen, onClose, noteCount = 0, imageCount = 0, documentCount = 0, linkCount = 0 }) {
  const [user, setUser] = useState({});

  useEffect(() => {
    // Example: get user info from localStorage (customize as needed)
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    setUser(userData);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-[rgb(13,148,136)] to-purple-400 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-2 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-5xl mb-2 border-4 border-purple-200 shadow-lg">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span role="img" aria-label="avatar">👤</span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{user.name || 'User Name'}</h3>
          <p className="text-base text-purple-100 mb-1">{user.email || 'user@email.com'}</p>
          <p className="text-base text-purple-200 mb-2">@{user.username || 'username'}</p>
        </div>
        {/* Profile Content */}
        <div className="bg-white rounded-t-3xl p-6 pt-4">
          <div className="space-y-3">
            <div className="bg-teal-50 rounded-lg p-3">
              <label className="block text-xs font-medium text-teal-600 mb-1">Member Since</label>
              <p className="text-sm text-teal-900">{user.memberSince || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="text-center bg-purple-50 rounded-lg p-2">
                <p className="text-lg font-bold text-purple-600">{noteCount}</p>
                <p className="text-xs text-gray-500">Notes</p>
              </div>
              <div className="text-center bg-purple-50 rounded-lg p-2">
                <p className="text-lg font-bold text-purple-600">{imageCount}</p>
                <p className="text-xs text-gray-500">Images</p>
              </div>
              <div className="text-center bg-purple-50 rounded-lg p-2">
                <p className="text-lg font-bold text-purple-600">{documentCount}</p>
                <p className="text-xs text-gray-500">Documents</p>
              </div>
              <div className="text-center bg-purple-50 rounded-lg p-2">
                <p className="text-lg font-bold text-purple-600">{linkCount}</p>
                <p className="text-xs text-gray-500">Links</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[rgb(13,148,136)] text-white rounded-lg hover:bg-purple-500 transition-colors text-sm shadow"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 