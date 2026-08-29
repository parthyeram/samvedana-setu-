import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createProject, getChallenge } from '../../api/client';

export default function AcceptChallenge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const institutionId = Number(searchParams.get('institutionId'));
  const [challenge, setChallenge] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getChallenge(id).then(response => {
      const item = response.data?.data;
      setChallenge(item);
      setTitle(item?.title || '');
    }).catch(requestError => setError(requestError.response?.data?.error || 'Could not load this assigned problem.'));
  }, [id]);

  const createTeamWorkspace = () => createProject({ challengeId: Number(id), title, institutionId }).then(response => navigate(`/institution/projects/${response.data.data.id}`)).catch(requestError => setError(requestError.response?.data?.error || 'Could not create the project team.'));

  if (error) return <div className="card card-pad"><h3>Problem unavailable</h3><p className="text-muted">{error}</p></div>;
  if (!challenge) return <div className="card card-pad">Loading challenge...</div>;

  return <div>
    <div className="page-head"><h2>Institute accepts challenge</h2><p>{challenge.displayId} - {challenge.category} - {challenge.subcategory || 'General'}</p></div>
    <div className="card card-pad">
      <h3>{challenge.title}</h3><p className="text-muted">{challenge.description}</p>
      <div className="flow-steps" style={{ margin: '22px 0' }}><span className="flow-step active">1. Institute accepts</span><span className="flow-step active">2. Create project team</span><span className="flow-step">3. Assign faculty</span><span className="flow-step">4. Assign students</span><span className="flow-step">5. Team created</span></div>
      <label>Project team name<input value={title} onChange={event => setTitle(event.target.value)} placeholder="Enter a name for the project team" /></label>
      <p className="text-muted">After creating the team workspace, select faculty mentors and students, then save the complete team.</p>
      <button className="btn btn-primary" onClick={createTeamWorkspace} disabled={!title.trim()}>Create Project Team</button>
    </div>
  </div>;
}
