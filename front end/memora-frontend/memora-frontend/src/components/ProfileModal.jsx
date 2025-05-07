import React, { useState } from 'react';

export default function ProfileModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Profile</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-4">
          <div className="flex flex-col items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-3xl mb-2">
              👤
            </div>
            <h3 className="text-lg font-semibold text-gray-800">John Doe</h3>
            <p className="text-sm text-gray-600">@johndoe</p>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <p className="text-sm text-gray-800">john.doe@example.com</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">Member Since</label>
              <p className="text-sm text-gray-800">January 2024</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="text-center bg-purple-50 rounded-lg p-2">
                <p className="text-lg font-bold text-purple-600">12</p>
                <p className="text-xs text-gray-500">Notes</p>
              </div>
              <div className="text-center bg-purple-50 rounded-lg p-2">
                <p className="text-lg font-bold text-purple-600">8</p>
                <p className="text-xs text-gray-500">Images</p>
              </div>
              <div className="text-center bg-purple-50 rounded-lg p-2">
                <p className="text-lg font-bold text-purple-600">5</p>
                <p className="text-xs text-gray-500">Documents</p>
              </div>
              <div className="text-center bg-purple-50 rounded-lg p-2">
                <p className="text-lg font-bold text-purple-600">3</p>
                <p className="text-xs text-gray-500">Links</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 