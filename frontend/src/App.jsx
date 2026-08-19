import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Users, Layout } from 'lucide-react';
import HomePage from './components/HomePage';
import QueueJoinPage from './components/QueueJoinPage';
import LiveQueueStatus from './components/LiveQueueStatus';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      {/* Premium Sticky Navigation Header */}
      <header className="app-header">
        <Link to="/" className="logo-container">
          <div style={{ 
            background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)', 
            padding: '8px', 
            borderRadius: '10px', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={18} />
          </div>
          <span className="logo-text">QueueIt</span>
        </Link>
        
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', fontWeight: '500' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
          <Link to="/admin" style={{ color: 'var(--text-secondary)' }}>Admin</Link>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
          <span style={{ color: 'var(--text-muted)' }}>v1.0.0</span>
        </div>
      </header>

      {/* Main Routes Content */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/venues/:venueId/queues/:queueId/join" element={<QueueJoinPage />} />
        <Route path="/queues/:queueId/status" element={<LiveQueueStatus />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/queues/:queueId" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
