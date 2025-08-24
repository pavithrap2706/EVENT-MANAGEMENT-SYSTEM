import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import './Vendors.css';

const Vendors = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: '',
    description: '',
    contactNumber: '',
    address: ''
  });
  const [serviceData, setServiceData] = useState({
    name: '',
    category: '',
    description: '',
    price: ''
  });

  useEffect(() => {
    fetchVendors();
    if (user?.role === 'vendor') {
      fetchMyProfile();
    }
  }, [user]);

  const fetchVendors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vendors');
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vendors/profile/me');
      setMyProfile(response.data);
      setProfileData({
        companyName: response.data.companyName || '',
        description: response.data.description || '',
        contactNumber: response.data.contactNumber || '',
        address: response.data.address || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/vendors/profile', profileData);
      setShowProfileForm(false);
      fetchMyProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating profile');
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/vendors/services', serviceData);
      setShowServiceForm(false);
      setServiceData({
        name: '',
        category: '',
        description: '',
        price: ''
      });
      fetchMyProfile();
      alert('Service added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding service');
    }
  };

  const handleInputChange = (e, setter) => {
    setter(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRemoveService = async (serviceId) => {
    try {
      await axios.delete(`http://localhost:5000/api/vendors/services/${serviceId}`);
      fetchMyProfile();
      alert('Service removed successfully!');
    } catch (error) {
      alert('Error removing service');
    }
  };

  const handleAvailabilityChange = async (availability) => {
    try {
      await axios.put('http://localhost:5000/api/vendors/availability', { availability });
      fetchMyProfile();
      alert('Availability updated successfully!');
    } catch (error) {
      alert('Error updating availability');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading vendors...</div>
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
        <div className="vendors-header">
          <h1>Vendors</h1>
          <p>{user?.role === 'organizer' ? 'Browse service vendors' : 'Manage your vendor profile'}</p>
          {user?.role === 'vendor' && (
            <div className="vendor-actions">
              <button 
                className="btn-primary"
                onClick={() => setShowProfileForm(true)}
              >
                {myProfile ? 'Edit Profile' : 'Create Profile'}
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowServiceForm(true)}
              >
                Add Service
              </button>
            </div>
          )}
        </div>

        {/* Profile Form Modal */}
        {showProfileForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{myProfile ? 'Edit Profile' : 'Create Vendor Profile'}</h2>
              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={profileData.companyName}
                    onChange={(e) => handleInputChange(e, setProfileData)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={profileData.description}
                    onChange={(e) => handleInputChange(e, setProfileData)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={profileData.contactNumber}
                    onChange={(e) => handleInputChange(e, setProfileData)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={profileData.address}
                    onChange={(e) => handleInputChange(e, setProfileData)}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">
                    {myProfile ? 'Update Profile' : 'Create Profile'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowProfileForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Service Form Modal */}
        {showServiceForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Add New Service</h2>
              <form onSubmit={handleServiceSubmit}>
                <div className="form-group">
                  <label>Service Name</label>
                  <input
                    type="text"
                    name="name"
                    value={serviceData.name}
                    onChange={(e) => handleInputChange(e, setServiceData)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={serviceData.category}
                    onChange={(e) => handleInputChange(e, setServiceData)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={serviceData.description}
                    onChange={(e) => handleInputChange(e, setServiceData)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={serviceData.price}
                    onChange={(e) => handleInputChange(e, setServiceData)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">
                    Add Service
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowServiceForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vendor Profile Section (for vendors) */}
        {user?.role === 'vendor' && myProfile && (
          <div className="vendor-profile-section">
            <h2>My Profile</h2>
            <div className="profile-card">
              <div className="profile-header">
                <h3>{myProfile.companyName}</h3>
                <span className={`availability ${myProfile.availability}`}>
                  {myProfile.availability}
                </span>
              </div>
              <p className="profile-description">{myProfile.description}</p>
              <div className="profile-info">
                <div className="info-item">
                  <strong>Contact:</strong> {myProfile.contactNumber}
                </div>
                <div className="info-item">
                  <strong>Address:</strong> {myProfile.address}
                </div>
                <div className="info-item">
                  <strong>Rating:</strong> {myProfile.rating}/5 ({myProfile.totalReviews} reviews)
                </div>
              </div>
              
              <div className="availability-controls">
                <h4>Update Availability</h4>
                <div className="availability-buttons">
                  <button 
                    className={`btn-availability ${myProfile.availability === 'available' ? 'active' : ''}`}
                    onClick={() => handleAvailabilityChange('available')}
                  >
                    Available
                  </button>
                  <button 
                    className={`btn-availability ${myProfile.availability === 'busy' ? 'active' : ''}`}
                    onClick={() => handleAvailabilityChange('busy')}
                  >
                    Busy
                  </button>
                  <button 
                    className={`btn-availability ${myProfile.availability === 'unavailable' ? 'active' : ''}`}
                    onClick={() => handleAvailabilityChange('unavailable')}
                  >
                    Unavailable
                  </button>
                </div>
              </div>

              {myProfile.services && myProfile.services.length > 0 && (
                <div className="services-section">
                  <h4>My Services</h4>
                  <div className="services-grid">
                    {myProfile.services.map((service) => (
                      <div key={service.id} className="service-card">
                        <div className="service-header">
                          <h5>{service.name}</h5>
                          <span className="service-category">{service.category}</span>
                        </div>
                        <p className="service-description">{service.description}</p>
                        <div className="service-price">${service.price}</div>
                        <button 
                          className="btn-remove"
                          onClick={() => handleRemoveService(service.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vendor Directory Section */}
        <div className="vendors-directory">
          <h2>{user?.role === 'organizer' ? 'Available Vendors' : 'Other Vendors'}</h2>
          <div className="vendors-grid">
            {vendors.length === 0 ? (
              <div className="no-vendors">
                <h3>No vendors found</h3>
                <p>No vendors are available at the moment.</p>
              </div>
            ) : (
              vendors.map((vendor) => (
                <div key={vendor.id} className="vendor-card">
                  <div className="vendor-header">
                    <h3>{vendor.companyName}</h3>
                    <span className={`availability ${vendor.availability}`}>
                      {vendor.availability}
                    </span>
                  </div>
                  <p className="vendor-description">{vendor.description}</p>
                  <div className="vendor-info">
                    <div className="info-item">
                      <strong>Contact:</strong> {vendor.contactNumber}
                    </div>
                    <div className="info-item">
                      <strong>Address:</strong> {vendor.address}
                    </div>
                    <div className="info-item">
                      <strong>Rating:</strong> {vendor.rating}/5 ({vendor.totalReviews} reviews)
                    </div>
                  </div>
                  {user?.role === 'organizer' && (
                    <div className="vendor-actions">
                      <button className="btn-primary">View Services</button>
                      <button className="btn-secondary">Contact Vendor</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vendors;
