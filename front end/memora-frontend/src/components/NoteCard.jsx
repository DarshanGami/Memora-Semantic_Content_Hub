import React from 'react';

const NoteCard = ({ title, onEdit }) => {
  return (
    <div className="h-32 bg-white border rounded shadow p-4 relative">
      📝 {title}
      <button
        onClick={onEdit}
        className="absolute top-2 right-2 text-sm text-blue-500 underline"
      >
        Edit
      </button>
    </div>
  );
};

export default NoteCard;

