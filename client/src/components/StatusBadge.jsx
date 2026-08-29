import React from 'react';

const statusMap = {
  submitted: 'submitted', under_review: 'review', verified: 'verified',
  matched: 'matched', assigned: 'assigned', accepted: 'accepted',
  rejected: 'rejected', closed: 'closed'
};

export default function StatusBadge({ status }) {
  const mapped = statusMap[status?.toLowerCase().replace(' ', '_')] || 'closed';
  return <span className={`badge badge-${mapped}`}>{status}</span>;
}