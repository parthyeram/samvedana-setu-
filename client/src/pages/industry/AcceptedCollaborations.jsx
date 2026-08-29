import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyInterests } from '../../api/client';

export default function AcceptedCollaborations() {
  const [items, setItems] = useState([]);
  useEffect(() => { getMyInterests().then(response => setItems((response.data?.data || []).filter(item => item.status === 'accepted'))).catch(() => {}); }, []);
  return <div><div className="page-head"><h2>Accepted collaborations</h2><p>Manage collaboration work accepted by your industry team.</p></div><div className="card">{items.length ? items.map(item => { const challenge = item.project?.challenge || item.challenge; const projectSubmitted = item.project?.status === 'Submitted'; let support = []; try { support = JSON.parse(item.supportTypes || '[]'); } catch {} return <div className="card-pad" key={item.id} style={{ borderBottom: '1px solid var(--border)' }}><h3>{challenge?.displayId || 'Community problem'} · {challenge?.title || 'Untitled problem'}</h3><p className="text-muted">Accepted collaboration · Support: {support.join(', ') || 'Expertise'}</p>{item.projectId && (projectSubmitted ? <span className="btn btn-secondary btn-sm">Submitted</span> : <Link className="btn btn-primary btn-sm" to={`/industry/projects/${item.projectId}`}>Create industry project team</Link>)}</div>; }) : <div className="card-pad">No accepted collaborations yet. Accept an Institute request from Collaboration Requests.</div>}</div></div>;
}
