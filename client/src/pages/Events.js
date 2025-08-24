import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import './Events.css';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Wedding',
    date: '',
    location: '',
    capacity: '',
    price: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/events', formData);
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        category: 'Wedding',
        date: '',
        location: '',
        capacity: '',
        price: ''
      });
      fetchEvents();
      alert('Event created successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating event');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAttendEvent = async (eventId) => {
    try {
      const event = events.find(e => e.id === eventId);
      setPaymentAmount(event.price);
      setSelectedEvent(event);
      setShowPaymentModal(true);
    } catch (error) {
      alert('Error processing attendance');
    }
  };

  const handlePaymentComplete = async () => {
    try {
      await axios.post(`http://localhost:5000/api/events/${selectedEvent.id}/attend`);
      setShowPaymentModal(false);
      setSelectedEvent(null);
      fetchEvents();
      alert('Payment successful! You are now registered for the event.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to register for event');
    }
  };

  const handleViewDetails = async (event) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events/${event.id}`);
      setSelectedEvent(response.data);
      setShowEventDetails(true);
    } catch (error) {
      alert('Error fetching event details');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateQRCode = (eventId, amount) => {
    // Your actual Google Pay UPI ID
    const upiId = 'praveenkumarsxlleb@oksbi';
    const eventTitle = events.find(e => e.id === eventId)?.title || 'Event Payment';
    
    // Create UPI payment URL
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(eventTitle)}&am=${amount}&tn=${encodeURIComponent(`Payment for ${eventTitle}`)}`;
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=28a745&bgcolor=ffffff&logo=https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user&data=${encodeURIComponent(upiUrl)}`;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading events...</div>
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
          <Link to="/dashboard" className="link">Dashboard</Link>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="events-header">
          <h1>Events</h1>
          <p>{user?.role === 'organizer' ? 'Manage your events' : 'Browse and attend events'}</p>
          {user?.role === 'organizer' && (
            <button 
              className="create-event-btn"
              onClick={() => setShowCreateForm(true)}
            >
              Create New Event
            </button>
          )}
        </div>

        {/* Create Event Modal */}
        {showCreateForm && (
          <div className="create-event-modal">
            <div className="modal-content">
              <h2>Create New Event</h2>
              <form onSubmit={handleCreateEvent}>
                <div className="form-group">
                  <label>Event Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Corporate">Corporate</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Conference">Conference</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date & Time</label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">
                    Create Event
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {showEventDetails && selectedEvent && (
          <div className="create-event-modal">
            <div className="modal-content">
              <h2>{selectedEvent.title}</h2>
              <div className="event-details-full">
                <p className="event-description">{selectedEvent.description}</p>
                <div className="event-info-full">
                  <div className="info-item">
                    <strong>Category:</strong> {selectedEvent.category}
                  </div>
                  <div className="info-item">
                    <strong>Date:</strong> {formatDate(selectedEvent.date)}
                  </div>
                  <div className="info-item">
                    <strong>Location:</strong> {selectedEvent.location}
                  </div>
                  <div className="info-item">
                    <strong>Capacity:</strong> {selectedEvent.capacity} people
                  </div>
                  <div className="info-item">
                    <strong>Price:</strong> ${selectedEvent.price}
                  </div>
                  <div className="info-item">
                    <strong>Status:</strong> 
                    <span className={`status ${selectedEvent.status}`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>
                
                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div className="attendees-list">
                    <h3>Attendees ({selectedEvent.attendees.length})</h3>
                    <div className="attendees-grid">
                      {selectedEvent.attendees.map((attendee) => (
                        <div key={attendee.id} className="attendee-item">
                          <strong>{attendee.userName}</strong>
                          <span>{attendee.userEmail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowEventDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedEvent && (
          <div className="create-event-modal">
            <div className="modal-content">
              <h2>Payment for {selectedEvent.title}</h2>
              <div className="payment-details">
                <div className="payment-info">
                  <h3>Event Details</h3>
                  <p><strong>Event:</strong> {selectedEvent.title}</p>
                  <p><strong>Date:</strong> {formatDate(selectedEvent.date)}</p>
                  <p><strong>Location:</strong> {selectedEvent.location}</p>
                  <p><strong>Amount:</strong> ${paymentAmount}</p>
                </div>
                
                <div className="qr-payment">
                  <h3>Scan QR Code to Pay</h3>
                  <div className="qr-container">
                    <img 
                      src={generateQRCode(selectedEvent.id, paymentAmount)} 
                      alt="Payment QR Code"
                      className="qr-code"
                    />
                  </div>
                                     <p className="qr-instructions">
                     Scan this QR code with Google Pay to complete the payment
                   </p>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-primary"
                  onClick={handlePaymentComplete}
                >
                  Confirm Payment
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="events-grid">
          {events.length === 0 ? (
            <div className="no-events">
              <h3>No events found</h3>
              <p>{user?.role === 'organizer' ? 'Create your first event to get started!' : 'No events are available at the moment.'}</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span className={`event-category ${event.category.toLowerCase()}`}>
                    {event.category}
                  </span>
                </div>
                <div className="event-details">
                  <p className="event-description">{event.description}</p>
                  <div className="event-info">
                    <div className="info-item">
                      <strong>Date:</strong> {formatDate(event.date)}
                    </div>
                    <div className="info-item">
                      <strong>Location:</strong> {event.location}
                    </div>
                    <div className="info-item">
                      <strong>Capacity:</strong> {event.capacity} people
                    </div>
                    <div className="info-item">
                      <strong>Attendees:</strong> {event.attendees ? event.attendees.length : 0} / {event.capacity}
                    </div>
                    <div className="info-item">
                      <strong>Price:</strong> ${event.price}
                    </div>
                    <div className="info-item">
                      <strong>Status:</strong> 
                      <span className={`status ${event.status}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="event-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => handleViewDetails(event)}
                  >
                    View Details
                  </button>
                  {user?.role === 'organizer' ? (
                    <button className="btn-secondary">Edit Event</button>
                  ) : (
                    <button 
                      className="btn-primary"
                      onClick={() => handleAttendEvent(event.id)}
                      disabled={event.attendees && event.attendees.length >= event.capacity}
                    >
                      {event.attendees && event.attendees.length >= event.capacity ? 'Full' : 'Attend Event'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
