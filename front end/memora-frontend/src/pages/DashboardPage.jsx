import React, { useEffect, useState } from 'react';
import api from '../services/api';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import FileCard from '../components/FileCard';
import LinkCard from '../components/LinkCard';
import FileUploadModal from '../components/FileUploadModal';
import LinkModal from '../components/LinkModal';

const DashboardPage = () => {
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState([]);
  const [links, setLinks] = useState([]);
  const [search, setSearch] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fileRes, noteRes, linkRes] = await Promise.all([
        api.get('/files'),
        api.get('/notes'),
        api.get('/links'),
      ]);
      setFiles(fileRes.data);
      setNotes(noteRes.data);
      setLinks(linkRes.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const handleNoteSubmit = async () => {
    try {
      if (editingNoteId) {
        const res = await api.put(`/notes/${editingNoteId}`, {
          title: noteTitle,
          content: noteContent,
        });
        setNotes(notes.map(n => (n._id === editingNoteId ? res.data : n)));
      } else {
        const res = await api.post('/notes', { title: noteTitle, content: noteContent });
        setNotes([res.data, ...notes]);
      }
      setNoteTitle('');
      setNoteContent('');
      setEditingNoteId(null);
      setShowNoteModal(false);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const handleFileUploaded = (file) => {
    setFiles([file, ...files]);
  };

  const handleLinkSaved = (link) => {
    setLinks([link, ...links]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <input
          type="text"
          placeholder="What are you looking for?"
          className="w-full p-3 rounded-lg border mb-6"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-4 mb-4">
          <button className="px-4 py-2 bg-gray-200 rounded-full">All</button>
          <button className="px-4 py-2 bg-gray-200 rounded-full">Images</button>
          <button className="px-4 py-2 bg-gray-200 rounded-full">Videos</button>
          <button className="px-4 py-2 bg-gray-200 rounded-full">Bookmarks</button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div
            onClick={() => {
              setEditingNoteId(null);
              setNoteTitle('');
              setNoteContent('');
              setShowNoteModal(true);
            }}
            className="h-32 bg-green-200 flex items-center justify-center text-5xl rounded cursor-pointer"
          >
            📝
          </div>
          <div
            onClick={() => setShowFileModal(true)}
            className="h-32 bg-blue-200 flex items-center justify-center text-5xl rounded cursor-pointer"
          >
            📁
          </div>
          <div
            onClick={() => setShowLinkModal(true)}
            className="h-32 bg-yellow-200 flex items-center justify-center text-5xl rounded cursor-pointer"
          >
            🔗
          </div>
          {files.map((f, i) => (
            <FileCard key={i} filename={f.filename} />
          ))}
          {notes.map((n) => (
            <NoteCard
              key={n._id}
              title={n.title}
              onEdit={() => {
                setEditingNoteId(n._id);
                setNoteTitle(n.title);
                setNoteContent(n.content);
                setShowNoteModal(true);
              }}
            />
          ))}
          {links.map((l, i) => (
            <LinkCard key={i} url={l.url} />
          ))}
        </div>
      </div>

      {showNoteModal && (
        <NoteModal
          title={noteTitle}
          content={noteContent}
          setTitle={setNoteTitle}
          setContent={setNoteContent}
          onSave={handleNoteSubmit}
          onClose={() => {
            setShowNoteModal(false);
            setEditingNoteId(null);
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
          onSaved={handleLinkSaved}
          onClose={() => setShowLinkModal(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
