import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Play, SkipForward, Power, AlertTriangle, RefreshCw, Building, Compass, Clock } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const MOCK_QUEUE_PEOPLE = [
  { userId: { _id: 'u1', name: 'Alice Smith', email: 'alice@gmail.com' }, name: 'Alice Smith' },
  { userId: { _id: 'u2', name: 'Bob Jones', email: 'bob@yahoo.com' }, name: 'Bob Jones' },
  { userId: { _id: 'u3', name: 'Charlie Brown', email: 'charlie@gmail.com' }, name: 'Charlie Brown' },
  { userId: { _id: 'u4', name: 'Diana Prince', email: 'diana@amazon.com' }, name: 'Diana Prince' }
];

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

export default function AdminDashboard() {
  const { queueId } = useParams();
  const navigate = useNavigate();

  const [queue, setQueue] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);

  // Offline mock states
  const [mockQueueList, setMockQueueList] = useState(MOCK_QUEUE_PEOPLE);
  const [mockServingUser, setMockServingUser] = useState(null);

  const fetchQueueDetails = async () => {
    if (!queueId) {
      try {
        const response = await axios.get(`${API_BASE}/queues/venues`);
        if (response.data && response.data.length > 0) {
          setVenues(response.data);
        } else {
          setVenues(MOCK_VENUES);
        }
        setError('');
      } catch (err) {
        console.warn('Backend API connection failed, loading admin selection in offline mode.');
        setOfflineMode(true);
        setError('Running in Offline Demo Mode');
        setVenues(MOCK_VENUES);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (offlineMode) {
      const selectedMockQueue = MOCK_VENUES.flatMap(v => v.queues).find(q => q._id === queueId);
      const queueName = selectedMockQueue ? selectedMockQueue.name : 'VIP Queue (Local Dev Dashboard)';
      setQueue({
        name: queueName,
        isActive: true,
        averageServiceTime: 12,
        nowServing: mockServingUser,
        queue: mockQueueList
      });
      setLoading(false);
      return;
    }

    try {
      const adminResponse = await axios.get(`${API_BASE}/queues/${queueId}/status`, {
        params: { admin: 'true' }
      });
      setQueue(adminResponse.data);
      setError('');
    } catch (err) {
      console.warn('Backend API connection failed, starting Admin Dashboard in local demo mode.');
      setOfflineMode(true);
      setError('Running in Offline Demo Mode');
      const selectedMockQueue = MOCK_VENUES.flatMap(v => v.queues).find(q => q._id === queueId);
      const queueName = selectedMockQueue ? selectedMockQueue.name : 'VIP Queue (Offline Demo)';
      setQueue({
        name: queueName,
        isActive: true,
        averageServiceTime: 10,
        nowServing: mockServingUser,
        queue: mockQueueList
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueDetails();
  }, [queueId, offlineMode, mockQueueList, mockServingUser]);

  const handleServeNext = async () => {
    if (offlineMode) {
      if (mockQueueList.length === 0) {
        setMockServingUser(null);
        alert('Queue is empty!');
        return;
      }
      const nextUser = mockQueueList[0];
      setMockServingUser(nextUser.userId);
      setMockQueueList(mockQueueList.slice(1));
      return;
    }

    try {
      const response = await axios.patch(`${API_BASE}/admin/queues/${queueId}/serve`);
      alert(response.data.message);
      fetchQueueDetails();
    } catch (err) {
      console.error('Failed to serve next user:', err.message);
      alert('Error serving next user. Switching to offline simulation.');
      setOfflineMode(true);
    }
  };

  const toggleQueueActive = () => {
    if (queue) {
      setQueue({
        ...queue,
        isActive: !queue.isActive
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (!queueId) {
    return (
      <div className="app-container">
        <div className="back-link" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Home
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <h1>Admin Control Panel</h1>
          <p className="text-muted">Select a virtual queue below to manage customers, serve tickets, and toggle queue status.</p>
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
                {venue.queues.map((q) => (
                  <div key={q._id} className="queue-item" style={{ background: 'rgba(255, 255, 255, 0.02)', margin: 0 }}>
                    <div className="queue-meta">
                      <span style={{ fontWeight: '600', color: '#f3f4f6', fontSize: '0.95rem' }}>{q.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                        <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                          <Users size={12} /> {q.queue ? q.queue.length : 0} waiting
                        </span>
                        <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                          <Clock size={12} /> {q.averageServiceTime} mins avg
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`badge ${q.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {q.isActive ? 'Open' : 'Closed'}
                      </span>
                      <button
                        className="btn btn-primary"
                        style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem', background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', border: 'none' }}
                        onClick={() => navigate(`/admin/queues/${q._id}`)}
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {error && (
          <div style={{ 
            marginTop: '24px', 
            background: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid rgba(245, 158, 11, 0.25)',
            padding: '10px 14px',
            borderRadius: '8px',
            color: '#fbbf24',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={14} /> {error}
            <button 
              onClick={() => { setOfflineMode(false); fetchQueueDetails(); }} 
              style={{ background: 'none', border: 'none', color: 'white', textDecoration: 'underline', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}
            >
              <RefreshCw size={10} /> Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // Find serving user name if running offline
  const nowServingName = queue?.nowServing 
    ? (typeof queue.nowServing === 'object' ? queue.nowServing.name : 'User ' + queue.nowServing.substring(0, 6))
    : 'None';

  return (
    <div className="app-container">
      <div className="back-link" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Venues
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2>Queue Operator Panel</h2>
          <span className={`badge ${queue?.isActive ? 'badge-active' : 'badge-inactive'}`}>
            {queue?.isActive ? 'Open' : 'Closed'}
          </span>
        </div>

        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{queue?.name}</h3>

        {/* Dashboard Actions */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button className="btn btn-primary" onClick={handleServeNext}>
            <Play size={16} /> Serve Next Customer
          </button>
          <button className="btn btn-secondary" onClick={toggleQueueActive}>
            <Power size={16} /> {queue?.isActive ? 'Close Queue' : 'Open Queue'}
          </button>
        </div>

        {/* Currently Serving Block */}
        <div style={{ 
          background: 'rgba(168, 85, 247, 0.1)', 
          border: '1px solid rgba(168, 85, 247, 0.25)', 
          borderRadius: '12px', 
          padding: '20px', 
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>
            Now Serving
          </span>
          <h1 style={{ color: 'var(--primary)', marginTop: '4px', fontSize: '2rem' }}>{nowServingName}</h1>
        </div>

        {/* Waiting customers list */}
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Users size={18} /> Customers in Line ({queue?.queue ? queue.queue.length : 0})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {queue?.queue && queue.queue.length > 0 ? (
              queue.queue.map((item, index) => {
                const name = item.name || (item.userId && item.userId.name) || 'Anonymous';
                const email = item.email || (item.userId && item.userId.email) || '';
                return (
                  <div key={index} className="queue-item" style={{ margin: 0, padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        color: 'var(--text-secondary)', 
                        fontWeight: '700', 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem'
                      }}>
                        {index + 1}
                      </span>
                      <div className="queue-meta">
                        <span style={{ fontWeight: '600' }}>{name}</span>
                        {email && <span className="text-muted" style={{ fontSize: '0.75rem' }}>{email}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <p>No customers waiting in line.</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{ 
            marginTop: '24px', 
            background: 'rgba(245, 158, 11, 0.1)', 
            border: '1px solid rgba(245, 158, 11, 0.25)',
            padding: '10px 14px',
            borderRadius: '8px',
            color: '#fbbf24',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={14} /> {error}
            <button 
              onClick={() => { setOfflineMode(false); fetchQueueDetails(); }} 
              style={{ background: 'none', border: 'none', color: 'white', textDecoration: 'underline', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto' }}
            >
              <RefreshCw size={10} /> Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
