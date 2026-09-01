import React, { useEffect, useState } from 'react';
import { getMyInterests, respondToIndustryInterest } from '../../api/client';
import { Link } from 'react-router-dom';

export default function MyInterests() {
  const [items, setItems] = useState([]);
  const load = () => getMyInterests().then(r => setItems(r.data?.data || []));
  useEffect(() => { load().catch(() => {}); }, []);
  const respond = (id, status) => respondToIndustryInterest(id, status).then(load);
  return <div><div className="page-head"><h2>Industry problem notifications</h2><p>Government-notified problems appear only in the matched industry account.</p></div><div className="card">{items.length ? items.map(item => { const challenge = item.project?.challenge || item.challenge; let support = []; try { support = JSON.parse(item.supportTypes || '[]'); } catch {} return <div className="card-pad" key={item.id} style={{ borderBottom: '1px solid var(--border)' }}><h3>{challenge?.displayId || 'Community problem'} - {challenge?.title || 'Untitled problem'}</h3><p className="text-muted">Support: {support.join(', ') || 'Expertise'} - Status: {item.status}</p>{item.status === 'interest_submitted' && <div><button className="btn btn-primary btn-sm" onClick={() => respond(item.id, 'accepted')}>Accept and form team</button><button className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }} onClick={() => respond(item.id, 'declined')}>Reject</button></div>}{item.status === 'accepted' && item.projectId && <Link className="btn btn-primary btn-sm" to={`/industry/projects/${item.projectId}`}>Manage industry team</Link>}</div>; }) : <div className="card-pad">No Government notifications for this industry yet.</div>}</div></div>;
}
