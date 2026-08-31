import React, { useEffect, useState } from 'react';
import { getCollaborations, submitInterest } from '../../api/client';

export default function PotentialCollaborations() {
  const [items, setItems] = useState([]);
  useEffect(() => { getCollaborations().then(r => setItems(r.data?.data || [])).catch(() => {}); }, []);
  const request = id => submitInterest({ challengeId: id, supportTypes: ['expertise', 'prototyping', 'field_test'], message: 'Our team can support this community solution.' }).then(() => setItems(current => current.map(x => x.id === id ? { ...x, status: 'Collaboration Requested' } : x)));
  const groups = items.reduce((result, item) => { const name = item.industry?.name || 'Unassigned industry'; (result[name] ||= []).push(item); return result; }, {});
  return <div><div className="page-head"><h2>Potential collaborations</h2><p>Problems are grouped under the industry assigned to support them.</p></div>{Object.keys(groups).length ? Object.entries(groups).map(([industry, problems]) => <section className="card" style={{ marginBottom: 20 }} key={industry}><div className="card-head"><h3>{industry}</h3><p className="text-muted">{problems.length} matched problem{problems.length === 1 ? '' : 's'}</p></div>{problems.map(c => <div className="card-pad" key={c.id} style={{ borderTop: '1px solid var(--border)' }}><h3>{c.displayId} · {c.title}</h3><p className="text-muted">{c.description} · {c.district || 'Location pending'}</p><p className="text-muted"><b>Assigned industry:</b> {industry} · {c.requestSource || 'Industry match'} · Match: {c.matchScore}%</p><button className="btn btn-primary btn-sm" onClick={() => request(c.id)} disabled={c.status === 'Collaboration Requested'}>{c.status === 'Collaboration Requested' ? 'Request sent' : 'Offer support'}</button></div>)}</section>) : <div className="card card-pad">No Government-matched projects or institute collaboration requests for this industry yet.</div>}</div>;
}
