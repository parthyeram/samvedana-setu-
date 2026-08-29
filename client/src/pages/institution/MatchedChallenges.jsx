import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatchedChallenges, acceptChallenge, declineChallenge, requestChallengeInfo } from '../../api/client';

export default function MatchedChallenges() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const load = () => getMatchedChallenges().then(r => setItems(r.data?.data || []));
  useEffect(() => { load().catch(() => {}); }, []);
 const accept = id => acceptChallenge(id).then(() => navigate(`/institution/accept/${id}`)); const decline = id => declineChallenge(id).then(load); const info = id => requestChallengeInfo(id).then(load);
 return <div><div className="page-head"><h2>AI-matched community problems</h2><p>These problems are matched to your institute by domain, expertise, location, and capability.</p></div><div className="card">{items.length ? items.map(({ challenge: c, match }) => <div className="card-pad" key={c.id} style={{ borderBottom: '1px solid var(--border)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}><div><h3>{c.displayId} · {c.title}</h3><p className="text-muted">{c.description}</p><p className="text-muted">{c.category} · {c.subcategory || 'General'} · {c.district || 'Location pending'} · {c.severity || 'Unclassified'}</p></div><strong style={{ color: 'var(--setu-cyan)', fontSize: 22 }}>{match?.matchScore}%<small style={{ display: 'block', color: 'var(--setu-muted)', fontSize: 11 }}>MATCH SCORE</small></strong></div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}><button className="btn btn-primary btn-sm" onClick={() => accept(c.id)} disabled={c.status === 'Interested'}>{c.status === 'Interested' ? 'Interest sent' : 'Accept challenge'}</button><button className="btn btn-secondary btn-sm" onClick={() => decline(c.id)}>Decline / re-match</button><button className="btn btn-secondary btn-sm" onClick={() => info(c.id)}>Request more information</button></div></div>) : <div className="card-pad">No scored problems are available for this institute yet. Government verification and matching must happen first.</div>}</div></div>;
}
