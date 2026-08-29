import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const icon = new L.Icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });

function Picker({ position, onChange }) {
  useMapEvents({ click(event) { onChange([event.latlng.lat, event.latlng.lng]); } });
  return position ? <Marker position={position} icon={icon} /> : null;
}

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.setView(position, 15); }, [position, map]);
  return null;
}

export default function MapPicker({ position, onChange }) {
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const locate = () => {
    if (!navigator.geolocation) return setMessage('Location is not supported by this browser.');
    setLocating(true); setMessage('Requesting your live location...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { onChange([coords.latitude, coords.longitude]); setLocating(false); setMessage('Live location selected.'); },
      error => { setLocating(false); setMessage(error.code === 1 ? 'Location permission was denied. Allow it in the browser, or click the map.' : 'Unable to detect location. Click the map to select it.'); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  const search = async event => {
    event.preventDefault();
    if (!query.trim()) return;
    setMessage('Searching location...');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(query)}`, { headers: { 'Accept-Language': 'en' } });
      const data = await response.json();
      setResults(data);
      setMessage(data.length ? 'Select a search result.' : 'Location not found. Try a nearby town or PIN code.');
    } catch { setMessage('Location search failed. Check your internet connection.'); }
  };
  const selectResult = result => { onChange([Number(result.lat), Number(result.lon)]); setQuery(result.display_name); setResults([]); setMessage('Location selected from search.'); };
  useEffect(() => { if (!position) locate(); }, []);
  return <div><form onSubmit={search} style={{ display: 'flex', gap: 8, marginBottom: 8 }}><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search village, town, district, area, or PIN code" aria-label="Search location" /><button type="submit" className="btn btn-secondary btn-sm">Search</button></form>{results.length > 0 && <div className="card card-pad" style={{ marginBottom: 8 }}>{results.map(result => <button type="button" key={result.place_id} onClick={() => selectResult(result)} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, background: 'transparent', padding: '8px 0', cursor: 'pointer', color: 'var(--setu-navy)' }}>{result.display_name}</button>)}</div>}<MapContainer center={position || [20.5937, 78.9629]} zoom={position ? 15 : 5} style={{ height: 280, width: '100%', borderRadius: 8 }} scrollWheelZoom><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Recenter position={position} /><Picker position={position} onChange={onChange} /></MapContainer><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}><button type="button" className="btn btn-primary btn-sm" onClick={locate} disabled={locating}>{locating ? 'Finding live location...' : 'Use my live location'}</button><small className="text-muted">{message || 'Search a place, click the map, or use live location.'}</small></div></div>;
}
