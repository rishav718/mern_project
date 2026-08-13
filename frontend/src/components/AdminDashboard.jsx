import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Play, SkipForward, Power, AlertTriangle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const MOCK_QUEUE_PEOPLE = [
  { userId: { _id: 'u1', name: 'Alice Smith', email: 'alice@gmail.com' }, name: 'Alice Smith' },
  { userId: { _id: 'u2', name: 'Bob Jones', email: 'bob@yahoo.com' }, name: 'Bob Jones' },
  { userId: { _id: 'u3', name: 'Charlie Brown', email: 'charlie@gmail.com' }, name: 'Charlie Brown' },
  { userId: { _id: 'u4', name: 'Diana Prince', email: 'diana@amazon.com' }, name: 'Diana Prince' }
];

export default function AdminDashboard() {
  const { queueId } = useParams();
  const navigate = useNavigate();

  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);

  // Offline mock states
  const [mockQueueList, setMockQueueList] = useState(MOCK_QUEUE_PEOPLE);
  const [mockServingUser, setMockServingUser] = useState(null);

  const fetchQueueDetails = async () => {
    if (offlineMode) {
      setQueue({
        name: 'VIP Queue (Local Dev Dashboard)',
        isActive: true,
        averageServiceTime: 12,
        nowServing: mockServingUser,
        queue: mockQueueList
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE}/queues/${queueId}/status`);
      // Since status endpoint returns custom fields, let's fetch details.
      // In the backend, GET /api/queues/:id/status returns detailed queue properties.
      // But wait! Let's check what our status endpoint returns:
      // Response has: { queueName, isActive, totalInQueue, nowServing, averageServiceTime }
      // It doesn't return the full queue list of user names because we optimized it for status checks.
      // Wait, let's look at what GET /api/queues/:id/status returns in queueRoutes.js.
      // It doesn't return the full queue array unless we ask it or query it.
      // But wait, the route has access to the full queue record inside the backend.
      // If we call GET /api/queues/:id/status, it returns:
      // responseData = { queueName: queue.name, isActive: queue.isActive, totalInQueue, nowServing: queue.nowServing, averageServiceTime }
      // To show the waiting customer names in the admin dashboard, we could update the status route
      // or implement a separate admin fetch, or retrieve the queue object.
      // Wait! Let's see: we can modify GET /api/queues/:id/status (or create a route)
      // to return the queue list if requested, or if the requester is an admin.
      // Let's modify the GET /api/queues/:id/status route to return the whole `queue` array
      // of participants if the query parameter `admin=true` is set.
      // This is extremely simple and elegant!

      const adminResponse = await axios.get(`${API_BASE}/queues/${queueId}/status`, {
        params: { admin: 'true' }
      });
      setQueue(adminResponse.data);
      setError('');
    } catch (err) {
      console.warn('Backend API connection failed, starting Admin Dashboard in local demo mode.');
      setOfflineMode(true);
      setError('Running in Offline Demo Mode');
      setQueue({
        name: 'VIP Queue (Offline Demo)',
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
  }, [offlineMode, mockQueueList, mockServingUser]);

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
