const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage (for demo purposes)
const users = [];
const events = [];
const vendors = [];
const attendees = []; // For tracking event attendance

// Simple JWT-like token generation
const generateToken = (user) => {
  return Buffer.from(JSON.stringify({
    userId: user.id,
    role: user.role,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  })).toString('base64');
};

// Simple password hashing (for demo purposes)
const hashPassword = (password) => {
  return Buffer.from(password).toString('base64');
};

const comparePassword = (password, hashedPassword) => {
  return hashPassword(password) === hashedPassword;
};

// Auth routes
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashPassword(password),
      role,
      createdAt: new Date()
    };

    users.push(newUser);

    // Create token
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    if (!comparePassword(password, user.password)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user || decoded.exp < Date.now()) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Events routes
app.get('/api/events', (req, res) => {
  try {
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/events', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user || user.role !== 'organizer') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, category, date, location, capacity, price } = req.body;

    const newEvent = {
      id: Date.now().toString(),
      title,
      description,
      category,
      date,
      location,
      capacity: parseInt(capacity),
      price: parseFloat(price),
      organizer: user.id,
      vendors: [],
      attendees: [],
      status: 'upcoming',
      createdAt: new Date()
    };

    events.push(newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event by ID with attendance
app.get('/api/events/:id', (req, res) => {
  try {
    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get attendee details
    const eventAttendees = attendees.filter(a => a.eventId === event.id);
    const eventWithAttendees = {
      ...event,
      attendees: eventAttendees
    };
    
    res.json(eventWithAttendees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for event attendance
app.post('/api/events/:id/attend', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const existingAttendance = attendees.find(a => 
      a.eventId === event.id && a.userId === user.id
    );
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check capacity
    const currentAttendees = attendees.filter(a => a.eventId === event.id).length;
    if (currentAttendees >= event.capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    const newAttendance = {
      id: Date.now().toString(),
      eventId: event.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      registeredAt: new Date(),
      status: 'registered'
    };

    attendees.push(newAttendance);
    res.status(201).json(newAttendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event attendance list
app.get('/api/events/:id/attendees', (req, res) => {
  try {
    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventAttendees = attendees.filter(a => a.eventId === event.id);
    res.json(eventAttendees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Vendors routes
app.get('/api/vendors', (req, res) => {
  try {
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/vendors/profile', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { companyName, description, contactNumber, address } = req.body;

    let vendor = vendors.find(v => v.userId === user.id);
    if (vendor) {
      // Update existing profile
      vendor.companyName = companyName;
      vendor.description = description;
      vendor.contactNumber = contactNumber;
      vendor.address = address;
    } else {
      // Create new profile
      vendor = {
        id: Date.now().toString(),
        userId: user.id,
        companyName,
        description,
        contactNumber,
        address,
        services: [],
        availability: 'available',
        rating: 0,
        totalReviews: 0,
        createdAt: new Date()
      };
      vendors.push(vendor);
    }

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor profile by user ID
app.get('/api/vendors/profile/me', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const vendor = vendors.find(v => v.userId === user.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add service to vendor profile
app.post('/api/vendors/services', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const vendor = vendors.find(v => v.userId === user.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const { name, category, description, price } = req.body;

    const newService = {
      id: Date.now().toString(),
      name,
      category,
      description,
      price: parseFloat(price),
      createdAt: new Date()
    };

    vendor.services.push(newService);
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove service from vendor profile
app.delete('/api/vendors/services/:serviceId', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const vendor = vendors.find(v => v.userId === user.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const serviceIndex = vendor.services.findIndex(s => s.id === req.params.serviceId);
    if (serviceIndex === -1) {
      return res.status(404).json({ message: 'Service not found' });
    }

    vendor.services.splice(serviceIndex, 1);
    res.json({ message: 'Service removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update vendor availability
app.put('/api/vendors/availability', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const vendor = vendors.find(v => v.userId === user.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const { availability } = req.body;
    vendor.availability = availability;

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Event Management System API - In-Memory Demo' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using in-memory database for demo purposes');
});
