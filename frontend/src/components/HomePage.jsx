import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Users, Clock, Compass, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Predefined mock data in case backend doesn't have venues/queues yet
const MOCK_VENUES = [
  {
    _id: 'v1',
    name: 'Central Bank Branch',
    location: 'Financial District, Block 4',
    queues: [
      { _id: 'q1', name: 'General Enquiries', isActive: true, averageServiceTime: 8, queue: [{}, {}, {}] },
      { _id: 'q2', name: 'Teller Services', isActive: true, averageServiceTime: 12, queue: [{}, {}, {}, {}, {}] }
    ]
  },
  {
    _id: 'v2',
    name: 'Metro Medical Center',
    location: 'Building B, Ground Floor',
    queues: [
      { _id: 'q3', name: 'General Checkup Line', isActive: true, averageServiceTime: 15, queue: [{}, {}] },
      { _id: 'q4', name: 'Pediatrics consultations', isActive: true, averageServiceTime: 20, queue: [{}] }
    ]
  },
  {
    _id: 'v3',
    name: 'City Council Office',
    location: 'City Hall, Room 102',
    queues: [
      { _id: 'q5', name: 'License Renewal', isActive: true, averageServiceTime: 10, queue: [{}, {}, {}, {}] },
      { _id: 'q6', name: 'Planning Permits', isActive: false, averageServiceTime: 25, queue: [] }
    ]
  }
];

export default function HomePage() {
  const [venues, setVenues] = useState(MOCK_VENUES);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE}/queues/venues`)
      .then(response => {
        if (response.data && response.data.length > 0) {
          setVenues(response.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn('Failed to fetch live venues from API. Using local mock fallbacks:', err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '12px' }}>Connecting to virtual queues...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div>
        <h1>Virtual Queues</h1>
        <p>Skip the physical line. Join a queue virtually and track your wait time in real-time.</p>
      </div>

      <div className="venue-list">
        {venues.map((venue) => (
          <div key={venue._id} className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '10px', borderRadius: '10px', color: '#c084fc' }}>
                <Building size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#f3f4f6' }}>{venue.name}</h3>
                <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Compass size={12} /> {venue.location}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {venue.queues.map((queue) => (
                <div key={queue._id} className="queue-item" style={{ background: 'rgba(255, 255, 255, 0.02)', margin: 0 }}>
                  <div className="queue-meta">
                    <span style={{ fontWeight: '600', color: '#f3f4f6', fontSize: '0.95rem' }}>{queue.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                      <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                        <Users size={12} /> {queue.queue ? queue.queue.length : 0} waiting
                      </span>
                      <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                        <Clock size={12} /> {queue.averageServiceTime} mins avg
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge ${queue.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {queue.isActive ? 'Open' : 'Closed'}
                    </span>
                    {queue.isActive && (
                      <button
                        className="btn btn-primary"
                        style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
                        onClick={() => navigate(`/venues/${venue._id}/queues/${queue._id}/join`)}
                      >
                        Join <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
