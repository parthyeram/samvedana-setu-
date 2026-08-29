import React from 'react';

export default function StatCard({ title, value, variant = 'total' }) {
  return (
    <div className={`stat-card si-${variant}`}>
      <div className="stat-num">{value}</div>
      <div className="stat-label">{title}</div>
    </div>
  );
}