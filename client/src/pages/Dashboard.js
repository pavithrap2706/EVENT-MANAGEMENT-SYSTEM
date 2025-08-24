import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    myEvents: 0,
    totalVendors: 0,
    totalAttendees: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsResponse, vendorsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/events'),
        axios.get('http://localhost:5000/api/vendors')
      ]);

      const events = eventsResponse.data;
      const vendors = vendorsResponse.data;

      // Calculate statistics
      const totalAttendees = events.reduce((total, event) => {
        return total + (event.attendees ? event.attendees.length : 0);
      }, 0);

      const myEvents = user?.role === 'organizer' 
        ? events.filter(event => event.organizer === user.id).length
        : 0;

      setStats({
        totalEvents: events.length,
        myEvents,
        totalVendors: vendors.length,
        totalAttendees
      });

      // Get recent events (last 5)
      const recent = events
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentEvents(recent);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>Event Management System</h2>
        </div>
        <div className="nav-user">
          <span className="user-info">
            Welcome, {user?.name} ({user?.role})
          </span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome to your event management dashboard</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.totalEvents}</h3>
              <p>Total Events</p>
            </div>
          </div>
          
          {user?.role === 'organizer' && (
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>{stats.myEvents}</h3>
                <p>My Events</p>
              </div>
            </div>
          )}
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.totalVendors}</h3>
              <p>Service Vendors</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎉</div>
            <div className="stat-content">
              <h3>{stats.totalAttendees}</h3>
              <p>Total Attendees</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-cards">
            {user?.role === 'organizer' ? (
              <>
                <Link to="/events" className="action-card">
                  <div className="action-icon">➕</div>
                  <h3>Create Event</h3>
                  <p>Create a new event and manage registrations</p>
                </Link>
                <Link to="/events" className="action-card">
                  <div className="action-icon">📋</div>
                  <h3>Manage Events</h3>
                  <p>View and manage your created events</p>
                </Link>
                <Link to="/vendors" className="action-card">
                  <div className="action-icon">🔧</div>
                  <h3>Find Vendors</h3>
                  <p>Browse and connect with service vendors</p>
                </Link>
              </>
            ) : (
              <>
                <Link to="/events" className="action-card">
                  <div className="action-icon">🎫</div>
                  <h3>Browse Events</h3>
                  <p>Find and register for events</p>
                </Link>
                <Link to="/vendors" className="action-card">
                  <div className="action-icon">👤</div>
                  <h3>My Profile</h3>
                  <p>Manage your vendor profile and services</p>
                </Link>
                <Link to="/vendors" className="action-card">
                  <div className="action-icon">📞</div>
                  <h3>Contact Organizers</h3>
                  <p>Connect with event organizers</p>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Events */}
        {recentEvents.length > 0 && (
          <div className="recent-events">
            <h2>Recent Events</h2>
            <div className="events-list">
              {recentEvents.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-info">
                    <h4>{event.title}</h4>
                    <p className="event-category">{event.category}</p>
                    <p className="event-date">{formatDate(event.date)}</p>
                    <p className="event-location">{event.location}</p>
                  </div>
                  <div className="event-stats">
                    <span className="attendees-count">
                      {event.attendees ? event.attendees.length : 0} / {event.capacity}
                    </span>
                    <span className="event-price">${event.price}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all-link">
              <Link to="/events" className="btn-primary">
                View All Events
              </Link>
            </div>
          </div>
        )}

        {/* Role-specific Information */}
        <div className="role-info">
          <h2>Getting Started</h2>
          {user?.role === 'organizer' ? (
            <div className="info-content">
              <h3>🎯 For Event Organizers</h3>
              <ul>
                <li>Create events with detailed information and pricing</li>
                <li>Track attendance and manage registrations</li>
                <li>Connect with service vendors for your events</li>
                <li>Monitor event performance and analytics</li>
                <li>Generate QR codes for easy payment processing</li>
              </ul>
            </div>
          ) : (
            <div className="info-content">
              <h3>🔧 For Service Vendors</h3>
              <ul>
                <li>Create and manage your vendor profile</li>
                <li>Add services with pricing and descriptions</li>
                <li>Update your availability status</li>
                <li>Browse and register for events</li>
                <li>Connect with event organizers</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
