import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { acceptChallenge, declineChallenge, getInstitutions, getMatchedChallenges } from '../../api/client';

export default function InstituteDirectory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reloadMatches = () => getMatchedChallenges().then(response => setMatches(response.data?.data || []));
  useEffect(() => { Promise.all([getInstitutions(), reloadMatches()]).then(([directory]) => setItems(directory.data?.data || [])).catch(requestError => setError(requestError.response?.data?.error || 'Could not load institutes. Start the backend server and refresh.')).finally(() => setLoading(false)); }, []);
  const respond = (id, action, institutionId) => (action === 'accept' ? acceptChallenge(id, { institutionId }).then(() => navigate('/institution/projects')) : declineChallenge(id, { institutionId })).then(reloadMatches).catch(() => {});

  if (loading) return <div><div className="page-head"><h2>All institutes</h2><p>Explore each institute's location, capability, and expertise.</p></div><div className="card card-pad">Loading institute directory...</div></div>;
  if (error) return <div><div className="page-head"><h2>All institutes</h2></div><div className="card card-pad"><h3>Institute directory unavailable</h3><p className="text-muted">{error}</p></div></div>;
  return <div><div className="page-head"><h2>All institutes</h2><p>Click an institute to view its expertise and problems assigned by Government.</p></div><div className="institute-directory-grid">{items.map((item, index) => { const open = selected === item.id; const assigned = matches.filter(entry => entry.institutionId === item.id); return <div className={`card card-pad institute-card ${open ? 'selected' : ''}`} key={item.id}><div className="institute-card-heading"><div><h3>#{index + 1} - {item.name}</h3><p className="text-muted">{item.district} - {item.type}</p></div><strong>{item.solvedProjects || 0} solved</strong></div><p className="text-muted">{item.description}</p><p><b>Expertise</b></p><div className="tag-list">{item.expertise?.map(skill => <span className="tag" key={skill}>{skill}</span>)}</div><button className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={() => setSelected(open ? null : item.id)}>{open ? 'Hide problems' : 'Show problems'}</button>{open && <div className="institute-detail">{assigned.length ? assigned.map(({ challenge, match }) => <div className="assigned-problem" key={challenge.id}><div><b>{challenge.displayId} - {challenge.title}</b><small>{challenge.district || 'Location pending'} - {challenge.category} - {match?.matchScore || 0}% match</small></div><div className="action-row"><button className="btn btn-primary btn-sm" onClick={() => respond(challenge.id, 'accept', item.id)}>Accept and form team</button><button className="btn btn-secondary btn-sm" onClick={() => respond(challenge.id, 'decline', item.id)}>Reject</button></div></div>) : <p className="text-muted">No Government-notified problem is assigned to this institute.</p>}</div>}</div>; })}</div></div>;
}
