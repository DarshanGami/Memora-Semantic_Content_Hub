import React from 'react';

const FileCard = ({ filename }) => {
  return (
    <div className="h-32 bg-white border rounded shadow p-4">📁 {filename}</div>
  );
};

export default FileCard;