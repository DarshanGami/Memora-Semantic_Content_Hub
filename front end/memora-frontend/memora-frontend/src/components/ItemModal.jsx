import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import api from '../services/api';

export default function ItemModal({ item, isOpen, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [copySuccess, setCopySuccess] = useState('');
  const [inputValue, setInputValue] = useState("");

  // Reset fields to item's current values whenever item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title || item.fileName || '');
      setContent(item.content || '');
      setUrl(item.url || item.fileUrl || '');
      setDescription(item.description || '');
      setTags(item.tags);
    }
  }, [item]);
  

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
      toast.info('Item copied!');
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopySuccess('Failed to copy');
      // toast.info('Fail copied!');
    }
  };



  const handleDownload = async () => {
    try {
      const response = await fetch(item.fileUrl);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Download started!');
    } catch (err) {
      console.error('Failed to download:', err);
      alert('Failed to download file');
    }
  };



  if (!isOpen || !item) return null;


  // BADHI API add UPDATE karvani chhe...................................................
  const handleSave = () => {
    let updated = { ...item, title };
    updated.title = title;
    
    if (item.type === 'note'){
      updated.content = content;
    } 
    
    if (item.type === 'link') {
      updated.url = url;
      updated.description = description;
    }
    
    if (item.type === 'image' || item.type === 'document') {
      updated.fileName = title;
      updated.fileUrl = url;
    }

    // Save tags for ALL item types
    updated.tags = tags;
    onSave(updated);
  };


  const handleDelete = () => {
    if(window.confirm('Are you sure you want to delete this card?')) {
      onDelete(item.id);
    }
  };

  // Custom - Tag
  const addTag = async (type, id, tagName) => {
    if (!tagName.trim()) return;
    console.log(type, id, tagName);
    try {
      const { data } = await api.patch(`/content/${type}/${id}/custom-tags`, { customTag: tagName });
      console.log('Tag updated:', data);
      setTags(data.tags || [...tags, tagName]);
      setInputValue('');
    } catch (err) {
      console.error('Error updating tags:', err.response?.data || err.message);
    }
  };

  // Remove - Tag
  const handleDeleteTag = async (index, tag) => {
    const contentType = item.type; // 'link', 'note', or 'image'
    const contentId = item.id;
    const encodedTag = encodeURIComponent(tag);

    const url = `http://localhost:8080/api/content/${contentType}/${contentId}/custom-tags/${encodedTag}`;
    const token = localStorage.getItem('token');
    console.log("cokki", token);
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // if using token auth
          // 'Content-Type': 'application/json',
        },
        credentials: 'include', // needed for cookie-based sessions
      });

      if (!res.ok) throw new Error('Unauthorized or failed request');
      
      removeTag(index);
    } catch (err) {
      console.error('Error deleting tag:', err);
      alert('You may not be authorized. Please log in again.');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags((prevTags) => prevTags.filter((_, index) => index !== indexToRemove));
  };


  return (
    
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[100vh] overflow-y-auto animate-fadeInUp">

        <div className="p-6 overflow-y-auto h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-teal-800 flex items-center gap-2">
              {item.type === 'note' && '📝'}
              {item.type === 'image' && '🖼️'}
              {item.type === 'document' && '📄'}
              {item.type === 'link' && '🔗'}
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Title always editable */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
              <input
                className="w-full p-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div> 

            {/* Note: content editable */}
            {item.type === 'note' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Content</label>
                <textarea
                  className="w-full p-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={10}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
                <button
                  onClick={() => handleCopy(content)}
                  className="mt-2 px-3 py-1 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 transition-colors text-sm"
                >
                  {copySuccess || 'Copy Content'}
                </button>
              </div>
            )}

            {/* Image: show image and fileName only */}
            {item.type === 'image' && (
              <div>
                <img
                  src={item.fileUrl}
                  alt={title}
                  className="w-full object-contain rounded-lg"
                  style={{ maxHeight: '60vh', maxWidth: '100%', display: 'block', margin: '0 auto' }}
                />
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">{item.fileName}</span>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 transition-colors text-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            )}

            {/* Document: show fileName only */}
            {item.type === 'document' && (
              <div>
                <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg">
                  <span className="text-teal-500">📄</span>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-700 underline"
                  >
                    {item.fileName}
                  </a>
                </div>
                <button
                  onClick={handleDownload}
                  className="mt-2 px-3 py-1 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 transition-colors text-sm"
                >
                  Download
                </button>
              </div>
            )}

            {/* Link: editable URL and description */}
            {item.type === 'link' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 p-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                    />
                    <button
                      onClick={() => handleCopy(url)}
                      className="px-3 py-1 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 transition-colors text-sm whitespace-nowrap"
                    >
                      {copySuccess || 'Copy URL'}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                  <input
                    className="w-full p-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Tags always editable for all*/}
            {/* <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma separated)</label>
              <input
                className="w-full p-2 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div> */}

            <div className="flex gap-2 overflow-x-auto pb-2">
              <div className="flex-shrink-0">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Enter one tag"
                  className="p-1 border rounded w-40"
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(item.type, item.id, inputValue);
                    }
                  }}
                />
                <button
                  onClick={() => addTag(item.type, item.id, inputValue)}
                  className="ml-2 mt-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                >
                  Add Tag
                </button>
              </div>

              <div className="flex items-center gap-2 flex-nowrap">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-200 text-gray-800 px-3 py-1 rounded-full whitespace-nowrap"
                  >
                    <span className="mr-2">{tag}</span>
                    <button
                      onClick={() => handleDeleteTag(index, tag)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>




            <div className="flex items-center justify-between mt-4">
              {/* <span className="text-xs text-gray-400">{item.date}</span> */}
              <div className="flex gap-2">
                <button onClick={handleDelete} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm">Delete</button>
                <button onClick={handleSave} className="px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .animate-fadeInUp {
          animation: fadeInUp 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 