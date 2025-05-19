import React, { useEffect, useState } from 'react';
import api from '../services/api';
import NoteModal from '../components/NoteModal';
import FileUploadModal from '../components/FileUploadModal';
import LinkModal from '../components/LinkModal';
import ProfileDropdown from '../components/ProfileDropdown';
import ItemModal from '../components/ItemModal';
import ErrorBoundary from '../components/ErrorBoundary';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    const [fileTags, setFileTags] = useState([]);

    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [noteTags, setNoteTags] = useState([]);
    const [editingNoteId, setEditingNoteId] = useState(null);

    const [linkTitle, setLinkTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [linkDescription, setLinkDescription] = useState('');
    const [linkTags, setLinkTags] = useState([]);
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

        // 1. Fetch all data in parallel
        const headersConfig = { headers };
        const [fileRes, noteRes, linkRes] = await Promise.all([
          api.get('/files', headersConfig),
          api.get('/notes', headersConfig),
          api.get('/links', headersConfig)
        ]);

        // 2. Process files
        const files = fileRes.data.map(file => {
          const extension = file.fileName?.split('.').pop().toLowerCase();
          const type = imageExtensions.includes(extension) ? 'image' : 'document';

          return {
            ...file,
            type,
            createdAt: file.createdAt || file.uploadDate,
            updatedAt:
              file.updatedAt ||
              file.modifiedDate ||
              file.createdAt ||
              file.uploadDate,
              tags: file.tags || [],
          };
        });

        // 3. Process notes
        const notes = noteRes.data.map(note => ({
          ...note,
          type: 'note',
          createdAt: note.createdAt || note.createdDate,
          updatedAt:
            note.updatedAt ||
            note.modifiedDate ||
            note.createdAt ||
            note.createdDate,
            tags: note.tags || [],
        }));

        // 4. Process links
        const links = linkRes.data.map(link => ({
          ...link,
          type: 'link',
          createdAt: link.createdAt || link.createdDate || new Date().toISOString(),
          updatedAt:
            link.updatedAt ||
            link.modifiedDate ||
            link.createdAt ||
            link.createdDate ||
            new Date().toISOString(),
            tags: link.tags || [],
        }));

        // console.log("linkkk", links);
        // 5. Combine and sort all items by newest first
        const allItems = [...notes, ...files, ...links].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setItems(allItems);

      } catch (err) {
        console.error('Error loading dashboard data:', {
          error: err,
          response: err.response,
          message: err.message
        });

        // Display appropriate error message
        if (err.response) {
          alert(`Failed to load data: ${err.response.data?.message || err.response.statusText}`);
        } else if (err.request) {
          alert('Server not responding. Please make sure it is running.');
        } else {
          alert(`Error: ${err.message}`);
        }
      }
    };

    console.log("papp", items);

    useEffect(() => {
      console.log("Updated items:", items);
    }, [items]);


  // Tags nu add karvanu API and field.............................................
  const handleNoteSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No authentication token found. Please login again.');
        return;
      }

      if(editingNoteId) {
        const response = await api.put(`/notes/${editingNoteId}`, {
          title: noteTitle,
          content: noteContent,
          tags: noteTags,
        });

        const updatedItem = {
          ...response.data,
          type: 'note',
          createdAt: response.data.createdAt || response.data.createdDate || new Date().toISOString(),
          updatedAt: response.data.updatedAt || response.data.modifiedDate || response.data.createdAt || new Date().toISOString(),
          tags: response.data.tags || [],
        };

        setItems(prev =>
          prev.map(item => (item._id === editingNoteId ? updatedItem : item))
        );

        toast.success('Item updated successfully!');
      } else {
        const response = await api.post('/notes', {
          title: noteTitle,
          content: noteContent,
          tags: noteTags,
        });

        const newItem = {
          ...response.data,
          type: 'note',
          createdAt: response.data.createdAt || response.data.createdDate || new Date().toISOString(),
          updatedAt: response.data.updatedAt || response.data.modifiedDate || response.data.createdAt || new Date().toISOString(),
          tags: response.data.tags || [],
        };

        setItems(prev => [newItem, ...prev]);
        toast.success('Item added successfully!');
      }

      setNoteTitle('');
      setNoteContent('');
      setNoteTags([]);
      setEditingNoteId(null);
      setShowNoteModal(false);
      // fetchData();
    } catch (err) {
      toast.error('Failed to save item!');
      console.error('Error saving note:', err);
    }
  };

  
  
  const handleFileUploaded = async (file) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:8080/api/files/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const uploadedFile = response.data;

      const extension = uploadedFile.fileName?.split('.').pop().toLowerCase();
      const type = imageExtensions.includes(extension) ? 'image' : 'document';

      const newFile = {
        ...uploadedFile,
        type,
        createdAt: uploadedFile.createdAt || uploadedFile.uploadDate || new Date().toISOString(),
        updatedAt: uploadedFile.updatedAt || uploadedFile.modifiedDate || uploadedFile.createdAt || new Date().toISOString(),
        tags: uploadedFile.tags || fileTags || [],
      };

      setItems(prev => [newFile, ...prev]);

      setShowFileModal(false);
      setFileTags([]);
      toast.success('Item added successfully!');
      fetchData();
    } catch (err) {
      console.error('Error uploading file:', err);
      toast.error('Failed to save item!');
    }
  };

  
  // tags nu add karvanu baki chhe.......................................
  const handleLinkSaved = async () => {
    const isValidUrl = (string) => {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    };

    if (!linkUrl || linkUrl.trim() === "") {
      toast.error('URL is required!');
      return;
    }

    if (!isValidUrl(linkUrl)) {
      toast.error('Please enter a valid URL!');
      return;
    }

    try {
      const response = await api.post('/links', {
        url: linkUrl,
        title: linkTitle,
        description: linkDescription,
        tags: linkTags,
      });

      const newLink = {
        ...response.data,
        type: 'link',
        createdAt: response.data.createdAt || new Date().toISOString(),
        updatedAt: response.data.updatedAt || response.data.createdAt || new Date().toISOString(),
        tags: response.data.tags || [],
      };

      setItems(prevItems => [newLink, ...prevItems]);

      setShowLinkModal(false);
      setLinkTitle("");
      setLinkUrl("");
      setLinkDescription("");
      setLinkTags([]);
      toast.success('Item added successfully!');
    } catch (err) {
      toast.error('Failed to save item!');
      console.error('Error saving link:', err);
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

  // Find number of items in tpye
  const getItemCount = (type) => {
    return items.filter((item) => item.type === type).length;
  };

  // Handler to open modal with item details
  const handleCardClick = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  useEffect(() => {
    if (editingNoteId) {
      // Only call handleNoteSubmit after states are set and editingNoteId changes
      handleNoteSubmit();
      window.location.reload();
    }
  }, [editingNoteId]);

  // Handler to save edits
  // Item Update no API backIn...................................................................
  const handleSaveItem = (updatedItem) => {
    // console.log("ok", updatedItem);
    if(updatedItem.type === "note"){
      setNoteTitle(updatedItem.title);
      setNoteContent(updatedItem.content);
      setNoteTags(updatedItem.tags || []);
      setEditingNoteId(updatedItem.id);
    }
    // setItems(items => items.map(i => i.id === updatedItem.id ? updatedItem : i));
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
      toast.info('Item deleted.');
    } catch (err) {
      toast.error('Failed to delete item!');
      console.error('Error deleting item:', err);
      // alert('Failed to delete item. Please try again.');
    }
  };

  return (
    // <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-100">
        {/* Fixed Header Section */}
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-br z-10">
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-3xl font-bold text-[rgb(13,148,136)]">Memora</h1>
              <ProfileDropdown />
            </div>

            {/* USER PROFILE BAKIIIII...................................... */}



            {/* Search and Filter Section */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                <div className="relative w-full md:w-96">
                  <input
                    type="text"
                    placeholder="What are you looking for?"
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
        <div className="pt-[180px] max-w-7xl mx-auto p-6">

          {/* Quick Action Buttons Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">

            <div
              onClick={() => {
                setEditingNoteId(null);
                setNoteTitle('');
                setNoteContent('');
                setNoteTags([]);
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
              onClick={() => 
                setShowFileModal(true)
              }
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
                setLinkTags([]);
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
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col border-2 ${
                  selectedItem && selectedItem.id === item.id && showItemModal
                    ? 'border-teal-500 ring-2 ring-teal-300'
                    : 'border-transparent'
                }`}
                onClick={() => handleCardClick(item)}
                style={{ position: 'relative' }}
              >
                <div className="p-6 flex flex-col flex-1">
                  {/* Title */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-teal-800 truncate w-full text-center">
                      {item.title || item.fileName || item.url}
                    </h3>
                    <span className="text-sm text-teal-500">
                      {item.type === "note" && "📝"}
                      {item.type === "image" && "🖼️"}
                      {item.type === "document" && "📄"}
                      {item.type === "link" && "🔗"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center">
                    {item.type === "document" && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-4xl text-teal-500 mb-2">📄</span>
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 underline text-lg font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.fileName}
                        </a>
                      </div>
                    )}

                    {item.type === "link" && (
                      <>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 underline text-lg font-medium break-all hover:text-teal-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.url}
                        </a>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">{item.description}</div>
                        )}
                      </>
                    )}

                    {item.type === "image" && (
                      <>
                        <img
                          src={item.fileUrl}
                          alt={item.fileName}
                          className="w-full object-cover rounded-lg mb-2"
                          style={{ maxHeight: 200 }}
                        />
                      </>
                    )}

                    {item.type === "note" && (
                      <div className="text-gray-600 mb-2 line-clamp-3">{item.content}</div>
                    )}
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-2 mb-2">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-teal-100 text-teal-800 text-sm font-medium px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Created & Modified Dates */}
                  <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-2 border-t border-teal-50">
                    <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                    <span>Modified: {new Date(item.updatedAt).toLocaleDateString()}</span>
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
            noteTags={noteTags}
            setNoteTags={setNoteTags}
            onAdded={handleNoteSubmit}
            onClose={() => {
              setShowNoteModal(false);
              setEditingNoteId(null);
              setNoteTitle('');
              setNoteContent('');
              setNoteTags([]);
            }}
          />
        )}

        
        {showFileModal && (
          <FileUploadModal
            onUploaded={handleFileUploaded}
            fileTags={fileTags}
            setFileTags={setFileTags}
            onClose={() => {
              setShowFileModal(false);
              setFileTags([]);
            }}
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
            linkTags={linkTags}
            setLinkTags={setLinkTags}
            onSaved={handleLinkSaved}
            onClose={() => {
              setShowLinkModal(false);
              setLinkTitle("");
              setLinkUrl("");
              setLinkTags([]);
              setLinkDescription("");
            }}
          />
        )}

      </div>
    // </ErrorBoundary>
  );
};

export default DashboardPage;
