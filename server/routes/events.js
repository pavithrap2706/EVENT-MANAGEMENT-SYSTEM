const express = require('express');
const Event = require('../models/Event');
const Vendor = require('../models/Vendor');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email')
      .populate('vendors', 'companyName contactNumber');
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('vendors', 'companyName contactNumber services');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new event (Organizer only)
router.post('/', auth, authorize('organizer'), async (req, res) => {
  try {
    const { title, description, category, date, location, capacity, price } = req.body;

    const event = new Event({
      title,
      description,
      category,
      date,
      location,
      capacity,
      price,
      organizer: req.user._id
    });

    await event.save();
    
    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name email');
    
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (Organizer only)
router.put('/:id', auth, authorize('organizer'), async (req, res) => {
  try {
    const { title, description, category, date, location, capacity, price, status } = req.body;

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer of this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, category, date, location, capacity, price, status },
      { new: true }
    ).populate('organizer', 'name email');

    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event (Organizer only)
router.delete('/:id', auth, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer of this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add vendor to event
router.post('/:id/vendors', auth, authorize('organizer'), async (req, res) => {
  try {
    const { vendorId } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer of this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this event' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (event.vendors.includes(vendorId)) {
      return res.status(400).json({ message: 'Vendor already assigned to this event' });
    }

    event.vendors.push(vendorId);
    await event.save();

    const updatedEvent = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('vendors', 'companyName contactNumber');

    res.json(updatedEvent);
  } catch (error) {
    console.error('Add vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove vendor from event
router.delete('/:id/vendors/:vendorId', auth, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer of this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this event' });
    }

    event.vendors = event.vendors.filter(
      vendor => vendor.toString() !== req.params.vendorId
    );
    await event.save();

    const updatedEvent = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('vendors', 'companyName contactNumber');

    res.json(updatedEvent);
  } catch (error) {
    console.error('Remove vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
