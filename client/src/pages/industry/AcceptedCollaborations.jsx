import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyInterests } from '../../api/client';

const submittedStatuses = ['Submitted', 'Government Review', 'Closed', 'Resolved'];

export default function AcceptedCollaborations() {
  const [items, setItems] = useState([]);
  useEffect(() => { getMyInterests().then(response => setItems((response.data?.data || []).filter(item => item.status === 'accepted'))).catch(() => {}); }, []);
  return <div><div className="page-head"><h2>Manage industry teams</h2><p>Accepted problems are grouped under your industry account. Create and manage a team for each solution.</p></div><div className="card">{items.length ? items.map(item => {
    const challenge = item.project?.challenge || item.challenge;
    const projectStatus = item.project?.status || '';
    const submitted = submittedStatuses.includes(projectStatus);
    let support = [];
    try { support = JSON.parse(item.supportTypes || '[]'); } catch {}
    return <div className="card-pad" key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
      <h3>{challenge?.displayId || 'Community problem'} · {challenge?.title || 'Untitled problem'}</h3>
      <p className="text-muted">Accepted collaboration · Support: {support.join(', ') || 'Expertise'} · Stage: {projectStatus || 'Team formation pending'}</p>
      {item.projectId && (submitted ? <span className="btn btn-secondary btn-sm">{projectStatus === 'Closed' || projectStatus === 'Resolved' ? 'Completed' : 'Submitted for government review'}</span> : <Link className="btn btn-primary btn-sm" to={`/industry/projects/${item.projectId}`}>Manage industry team</Link>)}
    </div>;
  }) : <div className="card-pad">No accepted collaborations yet. Accept an Institute request from Collaboration Requests.</div>}</div></div>;
}
