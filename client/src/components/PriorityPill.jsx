import React from 'react';

export default function PriorityPill({ level }) {
  const cls = `prio prio-${level?.toLowerCase()}`;
  return (
    <span className={cls}>
      <span className="dot"></span>
      {level}
    </span>
  );
}