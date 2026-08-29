import React, { useEffect, useState } from 'react';
import { getIndustryDirectory } from '../../api/client';

export default function IndustryDirectory() {
  const [items, setItems] = useState([]);
  useEffect(() => { getIndustryDirectory().then(response => setItems(response.data?.data || [])).catch(() => {}); }, []);
  return <div><div className="page-head"><h2>All industries</h2><p>Explore registered industry partners, their capabilities, resources, and civic focus areas.</p></div><div className="institute-directory-grid">{items.map(item => <div className="card card-pad institute-card" key={item.id}><div className="institute-card-heading"><div><h3>{item.name}</h3><p className="text-muted">{item.district || 'Location not listed'} · {item.type}</p></div><strong>{item.projects || 0} projects</strong></div><p className="text-muted">{item.description || 'Industry partner for community solutions.'}</p><p><b>Capabilities</b></p><div className="tag-list">{item.capabilities?.map(skill => <span className="tag" key={skill}>{skill}</span>)}</div><p className="text-muted" style={{ marginTop: 12 }}>Resources: {item.resources?.join(', ') || 'Expertise and collaboration support'}</p></div>)}</div></div>;
}
