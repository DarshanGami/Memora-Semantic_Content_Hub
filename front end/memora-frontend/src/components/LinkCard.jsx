import React from 'react';

const LinkCard = ({ url }) => {
  return (
    <div className="h-32 bg-white border rounded shadow p-4">🔗 {url}</div>
  );
};

export default LinkCard;