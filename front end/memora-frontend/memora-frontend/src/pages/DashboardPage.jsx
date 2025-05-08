import React, { useEffect, useState } from 'react';
import api from '../services/api';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import FileCard from '../components/FileCard';
import LinkCard from '../components/LinkCard';
import FileUploadModal from '../components/FileUploadModal';
import LinkModal from '../components/LinkModal';
import ProfileDropdown from '../components/ProfileDropdown';
import ItemModal from '../components/ItemModal';
import ErrorBoundary from '../components/ErrorBoundary';
import axios from 'axios';

const DashboardPage = () => {
  const [files, setFiles] = useState([]);
const [notes, setNotes] = useState([]);
const [links, setLinks] = useState([]);

const [search, setSearch] = useState('');
const [searchQuery, setSearchQuery] = useState('');
const [activeTab, setActiveTab] = useState("all");

const [showNoteModal, setShowNoteModal] = useState(false);
const [showFileModal, setShowFileModal] = useState(false);
const [showLinkModal, setShowLinkModal] = useState(false);

const [noteTitle, setNoteTitle] = useState('');
const [noteContent, setNoteContent] = useState('');
const [editingNoteId, setEditingNoteId] = useState(null);

const [linkTitle, setLinkTitle] = useState('');
const [linkUrl, setLinkUrl] = useState('');
const [linkDescription, setLinkDescription] = useState('');
const [editingLinkId, setEditingLinkId] = useState(null);

const [items, setItems] = useState([]);
const [selectedItem, setSelectedItem] = useState(null);
const [showItemModal, setShowItemModal] = useState(false);

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

  // Assume userId is available (e.g., from localStorage)
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    console.log('Dashboard mounted, fetching data...');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
     
      if (!token) {
        console.error('No token found');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [fileRes, noteRes, linkRes] = await Promise.all([
        api.get('/files', { headers }),
        api.get('/notes', { headers }),
        api.get('/links', { headers })
      ]);

      const files = fileRes.data.map(f => {
        let type = 'document';
        if (f.fileName) {
          const ext = f.fileName.split('.').pop().toLowerCase();
          if (imageExtensions.includes(ext)) {
            type = 'image';
          }
        }
        return { 
          ...f, 
          type,
          createdAt: f.createdAt || f.uploadDate,
          updatedAt: f.updatedAt || f.modifiedDate || f.createdAt || f.uploadDate
        };
      });

      const notes = noteRes.data.map(n => ({ 
        ...n, 
        type: 'note',
        createdAt: n.createdAt || n.createdDate,
        updatedAt: n.updatedAt || n.modifiedDate || n.createdAt || n.createdDate
      }));
      
      const links = linkRes.data.map(l => ({ 
        ...l, 
        type: 'link',
        createdAt: l.createdAt || l.createdDate,
        updatedAt: l.updatedAt || l.modifiedDate || l.createdAt || l.createdDate
      }));

      const allItems = [...notes, ...files, ...links];
      // Sort items by createdAt date in descending order (newest first)
      allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setItems(allItems);
    } catch (err) {
      console.error('Error loading dashboard:', {
        error: err,
        response: err.response,
        message: err.message
      });
     
      if (err.response) {
        // Server responded with error
        alert(`Failed to load data: ${err.response.data?.message || err.response.statusText}`);
      } else if (err.request) {
        // No response received
        alert('Server not responding. Please check if the server is running.');
      } else {
        // Request setup error
        alert(`Error: ${err.message}`);
      }
    }
  };

  useEffect(() => {
    console.log("Updated items:", items);
  }, [items]);

  const handleNoteSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No authentication token found. Please login again.');
        return;
      }

      if (editingNoteId) {
        await api.put(`/notes/${editingNoteId}`, {
          title: noteTitle,
          content: noteContent,
        });
      } else {
        await api.post('/notes', {
          title: noteTitle,
          content: noteContent
        });
      }
      setNoteTitle('');
      setNoteContent('');
      setEditingNoteId(null);
      setShowNoteModal(false);
      fetchData(); // Refresh all data
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note. Check console for details.');
    }
  };

  const handleFileUploaded = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      await axios.post('http://localhost:8080/api/files/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setShowFileModal(false);
      fetchData();
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file.');
    }
  };

  const handleLinkSaved = async () => {
    try {
      await api.post('/links', {
        url: linkUrl,
        title: linkTitle,
        description: linkDescription
      });
      setShowLinkModal(false);
      setLinkTitle("");
      setLinkUrl("");
      setLinkDescription("");
      fetchData();
    } catch (err) {
      console.error('Error saving link:', err);
      alert('Failed to save link.');
    }
  };

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesTitle =
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.fileName && item.fileName.toLowerCase().includes(query)) ||
      false;
    const matchesTags = item.tags && item.tags.some(tag => tag && tag.toLowerCase().includes(query));
    const matchesTab = activeTab === "all" || item.type === activeTab;
    return (matchesTitle || matchesTags) && matchesTab;
  });

  const getItemCount = (type) => {
    return items.filter((item) => item.type === type).length;
  };

  // Handler to open modal with item details
  const handleCardClick = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  // Handler to save edits
  const handleSaveItem = (updatedItem) => {
    setItems(items => items.map(i => i.id === updatedItem.id ? updatedItem : i));
    setShowItemModal(false);
    setSelectedItem(null);
  };

  // Handler to delete item
  const handleDeleteItem = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No authentication token found. Please login again.');
        return;
      }

      const item = items.find(i => i.id === id);
      if (!item) return;

      // Make API call based on item type
      switch (item.type) {
        case 'note':
          await api.delete(`/notes/${id}`);
          break;
        case 'image':
        case 'document':
          await api.delete(`/files/${id}`);
          break;
        case 'link':
          await api.delete(`/links/${id}`);
          break;
        default:
          console.error('Unknown item type:', item.type);
          return;
      }

      // Update local state after successful deletion
      setItems(items => items.filter(i => i.id !== id));
      setShowItemModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Fixed Header Section */}
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-br from-gray-100 to-gray-200 z-10">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-[rgb(13,148,136)]">Memora</h1>
              <ProfileDropdown />
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-[rgb(13,148,136)] focus:outline-none focus:ring-2 focus:ring-[rgb(13,148,136)] focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-[rgb(13,148,136)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === "all"
                        ? "bg-[rgb(13,148,136)] text-white"
                        : "bg-teal-100 text-teal-700 hover:bg-teal-200"
                    }`}
                  >
                    All ({items.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("note")}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === "note"
                        ? "bg-[rgb(13,148,136)] text-white"
                        : "bg-teal-100 text-teal-700 hover:bg-teal-200"
                    }`}
                  >
                    Notes ({getItemCount("note")})
                  </button>
                  <button
                    onClick={() => setActiveTab("image")}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === "image"
                        ? "bg-[rgb(13,148,136)] text-white"
                        : "bg-teal-100 text-teal-700 hover:bg-teal-200"
                    }`}
                  >
                    Images ({getItemCount("image")})
                  </button>
                  <button
                    onClick={() => setActiveTab("document")}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === "document"
                        ? "bg-[rgb(13,148,136)] text-white"
                        : "bg-teal-100 text-teal-700 hover:bg-teal-200"
                    }`}
                  >
                    Documents ({getItemCount("document")})
                  </button>
                  <button
                    onClick={() => setActiveTab("link")}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      activeTab === "link"
                        ? "bg-[rgb(13,148,136)] text-white"
                        : "bg-teal-100 text-teal-700 hover:bg-teal-200"
                    }`}
                  >
                    Links ({getItemCount("link")})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="pt-[200px] max-w-7xl mx-auto p-6">
          {/* Quick Action Buttons Row */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div
              onClick={() => {
                setEditingNoteId(null);
                setNoteTitle('');
                setNoteContent('');
                setShowNoteModal(true);
              }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="p-4">
                <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-base font-semibold text-center text-teal-800">New Note</h3>
                <p className="text-xs text-teal-600 text-center mt-1">Create a new note</p>
              </div>
            </div>

            <div
              onClick={() => setShowFileModal(true)}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="p-4">
                <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🖼️</span>
                </div>
                <h3 className="text-base font-semibold text-center text-teal-800">Upload Image</h3>
                <p className="text-xs text-teal-600 text-center mt-1">Add a new image</p>
              </div>
            </div>

            <div
              onClick={() => setShowFileModal(true)}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="p-4">
                <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-base font-semibold text-center text-teal-800">Upload Document</h3>
                <p className="text-xs text-teal-600 text-center mt-1">Add a new document</p>
              </div>
            </div>

            <div
              onClick={() => {
                setLinkTitle("");
                setLinkUrl("");
                setLinkDescription("");
                setShowLinkModal(true);
              }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="p-4">
                <div className="flex items-center justify-center h-12 w-12 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-full mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="text-base font-semibold text-center text-teal-800">Add Link</h3>
                <p className="text-xs text-teal-600 text-center mt-1">Save a new link</p>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col border-2 ${selectedItem && selectedItem.id === item.id && showItemModal ? 'border-teal-500 ring-2 ring-teal-300' : 'border-transparent'}`}
                onClick={() => handleCardClick(item)}
                style={{ position: 'relative' }}
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-teal-800 truncate w-full text-center">
                      {/* Centered title for all types */}
                      {item.type === "document" && (item.title || item.fileName)}
                      {item.type === "link" && (item.title || item.url)}
                      {item.type === "note" && item.title}
                      {item.type === "image" && (item.title || item.fileName)}
                    </h3>
                    <span className="text-sm text-teal-500">
                      {item.type === "note" && "📝"}
                      {item.type === "image" && "🖼️"}
                      {item.type === "document" && "📄"}
                      {item.type === "link" && "🔗"}
                    </span>
                  </div>
                  <div className="flex-1">
                    {/* Document Card UI */}
                    {item.type === "document" && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-4xl text-teal-500">📄</span>
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-700 underline text-lg font-medium"
                            onClick={e => e.stopPropagation()}
                          >
                            {item.fileName}
                          </a>
                        </div>
                      </div>
                    )}
                    {/* Link Card UI */}
                    {item.type === "link" && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 underline text-lg font-medium text-center break-all hover:text-teal-800"
                          onClick={e => e.stopPropagation()}
                        >
                          {item.url}
                        </a>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1 text-center max-w-xs">{item.description}</div>
                        )}
                      </div>
                    )}
                    {/* Image Card UI */}
                    {item.type === "image" && (
                      <>
                        <div className="font-semibold text-base text-teal-800 mb-2 text-center">{item.title || item.fileName}</div>
                        <img
                          src={item.fileUrl}
                          alt={item.fileName}
                          className="w-full object-cover rounded-lg"
                          style={{ maxHeight: 200 }}
                        />
                      </>
                    )}
                    {/* Note Card UI */}
                    {item.type === "note" && (
                      <div className="text-gray-600 mb-4 line-clamp-3 text-center">{item.content}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <div className="mb-2 max-w-full overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-teal-300 scrollbar-track-teal-50" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {(item.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 bg-teal-100 text-teal-600 rounded-full text-xs mr-2 mb-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-xs text-gray-500">Modified: {new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Item Modal */}
          <ItemModal
            item={selectedItem}
            isOpen={showItemModal}
            onClose={() => { setShowItemModal(false); setSelectedItem(null); }}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
          />
        </div>

        {showNoteModal && (
          <NoteModal
            title={noteTitle}
            content={noteContent}
            setTitle={setNoteTitle}
            setContent={setNoteContent}
            onAdded={handleNoteSubmit}
            onClose={() => {
              setShowNoteModal(false);
              setEditingNoteId(null);
              setNoteTitle('');
              setNoteContent('');
            }}
          />
        )}

        {showFileModal && (
          <FileUploadModal
            onUploaded={handleFileUploaded}
            onClose={() => setShowFileModal(false)}
          />
        )}

        {showLinkModal && (
          <LinkModal
            title={linkTitle}
            setTitle={setLinkTitle}
            url={linkUrl}
            setUrl={setLinkUrl}
            description={linkDescription}
            setDescription={setLinkDescription}
            onSaved={handleLinkSaved}
            onClose={() => {
              setShowLinkModal(false);
              setLinkTitle("");
              setLinkUrl("");
              setLinkDescription("");
            }}
          />
        )}

      </div>
    </ErrorBoundary>
  );
};

export default DashboardPage;
