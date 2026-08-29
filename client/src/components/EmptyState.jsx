import React from 'react';

export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="empty">
      <div className="emoji">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}