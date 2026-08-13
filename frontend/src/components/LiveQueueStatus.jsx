import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, LogOut, RefreshCw, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function LiveQueueStatus() {
  const { queueId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get('userId');
  const isMock = searchParams.get('mock') === 'true';

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [pollingActive, setPollingActive] = useState(true);

  // Mock states for simulation if running offline
  const [mockPosition, setMockPosition] = useState(4);
  const [mockTotal, setMockTotal] = useState(7);
  const [mockServing, setMockServing] = useState(false);

  const fetchStatus = async (showLoading = false) => {
    if (isMock) {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      // Simulate offline demo behavior
      setTimeout(() => {
        setStatus({
          queueName: 'VIP Queue (Demo Mode)',
          isActive: true,
          totalInQueue: mockTotal,
          inQueue: !mockServing,
          position: mockServing ? 0 : mockPosition,
          isNowServing: mockServing,
          estimatedWaitTime: mockServing ? 0 : mockPosition * 12,
          averageServiceTime: 12
        });
        setLoading(false);
        setRefreshing(false);
      }, 300);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      const response = await axios.get(`${API_BASE}/queues/${queueId}/status`, {
        params: { userId }
      });
      setStatus(response.data);
      setError('');
    } catch (err) {
      console.warn('Failed to fetch status from API:', err.message);
      setError('Database offline. Switch to mock simulation?');
      // If error occurs, fallback to a local mock structure so UI doesn't look broken
      setStatus({
        queueName: 'VIP Queue (Local)',
        isActive: true,
        totalInQueue: 3,
        inQueue: true,
        position: 2,
        estimatedWaitTime: 20,
        averageServiceTime: 10
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus(true);

    // Setup polling every 5 seconds
    const interval = setInterval(() => {
      if (pollingActive) {
        fetchStatus(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, pollingActive, mockPosition, mockTotal, mockServing]);

  // Demo simulation triggers
  useEffect(() => {
    if (isMock && mockPosition > 0) {
      const demoTimer = setInterval(() => {
        setMockPosition((prev) => {
          if (prev <= 1) {
            setMockServing(true);
            return 0;
          }
          return prev - 1;
        });
        setMockTotal((prev) => Math.max(1, prev - 1));
      }, 10000); // advance every 10s in demo mode

      return () => clearInterval(demoTimer);
    }
  }, [isMock, mockPosition]);

  const handleLeaveQueue = async () => {
    if (window.confirm('Are you sure you want to leave the queue?')) {
      if (isMock) {
        alert('You left the queue (Demo).');
        navigate('/');
        return;
      }

      if (!userId) {
        localStorage.removeItem(`joined_queue_${queueId}`);
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        await axios.delete(`${API_BASE}/queues/${queueId}/leave`, {
          params: { userId },
          data: { userId }
        });
        localStorage.removeItem(`joined_queue_${queueId}`);
        navigate('/');
      } catch (err) {
        console.error('Failed to leave queue:', err.message);
        localStorage.removeItem(`joined_queue_${queueId}`);
        alert('Left the queue.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your ticket details...</p>
      </div>
    );
  }

  const notInQueue = status && !status.inQueue && !status.isNowServing;

  if (notInQueue) {
    return (
      <div className="app-container">
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--warning)', marginBottom: '8px' }}>Not in Queue</h2>
          <p>You are no longer in this virtual queue (you may have left or been served).</p>
          <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isServing = status?.isNowServing || status?.position === 0;

  return (
    <div className="app-container">
      <div className="back-link" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Home
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <span className="live-indicator"></span>
          <span className="text-muted" style={{ marginLeft: '6px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>
            Live Status
          </span>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{status?.queueName}</h2>
        <p className="text-muted" style={{ marginBottom: '24px' }}>Ticket holder ID: {userId?.substring(0, 8)}...</p>

        {isServing ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
              <CheckCircle size={48} />
            </div>
            <h1 style={{ color: '#10b981', fontSize: '2rem' }}>You Are Up!</h1>
            <p style={{ marginTop: '8px', color: 'var(--text-primary)' }}>Please proceed to the counter immediately. An operator is ready to serve you.</p>
          </div>
        ) : (
          <div>
            <div className="stat-container">
              <div className="stat-box">
                <span className="stat-label">Position</span>
                <span className="stat-value stat-value-highlight">#{status?.position}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Wait Time</span>
                <span className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {status?.estimatedWaitTime} <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-secondary)' }}>min</span>
                </span>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              borderRadius: '12px', 
              padding: '16px', 
              margin: '16px 0', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'space-around',
              fontSize: '0.9rem'
            }}>
              <div>
                <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>PEOPLE IN FRONT</span>
                <strong style={{ fontSize: '1.1rem' }}>{status?.position - 1}</strong>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)' }}></div>
              <div>
                <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem' }}>TOTAL IN LINE</span>
                <strong style={{ fontSize: '1.1rem' }}>{status?.totalInQueue}</strong>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={() => fetchStatus(false)} disabled={refreshing}>
            <RefreshCw size={16} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-danger" onClick={handleLeaveQueue} disabled={refreshing}>
            <LogOut size={16} /> Leave Line
          </button>
        </div>

        {error && (
          <div style={{ marginTop: '16px', color: 'var(--warning)', fontSize: '0.8rem' }}>
            {error} <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate(`/queues/${queueId}/status?userId=${userId}&mock=true`)}>Activate simulation</span>
          </div>
        )}
      </div>

      {isMock && (
        <div className="card" style={{ marginTop: '16px', border: '1px dashed var(--accent-cyan)' }}>
          <h3>Demo Controller</h3>
          <p className="text-muted">Simulate admin activity directly from this debug panel:</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '6px' }}
              onClick={() => {
                setMockPosition((prev) => Math.max(1, prev - 1));
                setMockTotal((prev) => Math.max(1, prev - 1));
              }}
              disabled={mockPosition <= 1}
            >
              Advance Position
            </button>
            <button 
              className="btn btn-primary" 
              style={{ fontSize: '0.8rem', padding: '6px' }}
              onClick={() => {
                setMockPosition(0);
                setMockServing(true);
              }}
            >
              Force Call Me
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
