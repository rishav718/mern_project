import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Send, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function QueueJoinPage() {
  const { queueId, venueId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // POST request to join the queue
      const response = await axios.post(`${API_BASE}/queues/${queueId}/join`, {
        name,
        email
      });

      const { queue, message } = response.data;
      
      // Extract userId from response - we should make sure we know who the user is.
      // Since we just saved/retrieved user in backend, we should return user ID or check queue array.
      // Let's find the user in the returned queue array
      const userEntry = queue.queue.find(item => item.email === email);
      const userId = userEntry ? userEntry.userId : 'mock_user_id';

      // Store local joined details for easier navigation/session persistence
      localStorage.setItem(`joined_queue_${queueId}`, JSON.stringify({
        userId,
        name,
        email
      }));

      navigate(`/queues/${queueId}/status?userId=${userId}`);
    } catch (err) {
      console.warn('Backend API connection failed, falling back to mock join flow:', err.message);
      
      // Fallback Mock logic for offline testing
      const mockUserId = 'usr_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(`joined_queue_${queueId}`, JSON.stringify({
        userId: mockUserId,
        name,
        email
      }));
      
      // Mock alert about offline status
      alert('Note: Server is offline. Starting in offline demo mode.');
      navigate(`/queues/${queueId}/status?userId=${mockUserId}&mock=true`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="back-link" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Venues
      </div>

      <div className="card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Join Virtual Queue
        </h2>
        <p>Please enter your details to receive your virtual queue ticket.</p>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            padding: '12px', 
            borderRadius: '8px', 
            color: '#f87171', 
            marginBottom: '16px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Your Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '40px' }}
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '40px' }}
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }} disabled={loading}>
            {loading ? 'Joining Line...' : 'Get Ticket'} <Send size={16} />
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <span 
          style={{ color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
          onClick={() => navigate(`/admin/queues/${queueId}`)}
        >
          Access Admin Dashboard for this Queue
        </span>
      </div>
    </div>
  );
}
