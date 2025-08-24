const express = require('express');
const Vendor = require('../models/Vendor');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find()
      .populate('user', 'name email')
      .select('-services');
    res.json(vendors);
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor by ID
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor profile (Vendor only)
router.get('/profile/me', auth, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id })
      .populate('user', 'name email');
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    
    res.json(vendor);
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create/Update vendor profile (Vendor only)
router.post('/profile', auth, authorize('vendor'), async (req, res) => {
  try {
    const { companyName, description, contactNumber, address } = req.body;

    let vendor = await Vendor.findOne({ user: req.user._id });
    
    if (vendor) {
      // Update existing profile
      vendor.companyName = companyName;
      vendor.description = description;
      vendor.contactNumber = contactNumber;
      vendor.address = address;
    } else {
      // Create new profile
      vendor = new Vendor({
        user: req.user._id,
        companyName,
        description,
        contactNumber,
        address
      });
    }

    await vendor.save();
    
    const populatedVendor = await Vendor.findById(vendor._id)
      .populate('user', 'name email');
    
    res.json(populatedVendor);
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vendor's assigned events (Vendor only)
router.get('/events/me', auth, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const events = await Event.find({ vendors: vendor._id })
      .populate('organizer', 'name email');
    
    res.json(events);
  } catch (error) {
    console.error('Get vendor events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update vendor availability (Vendor only)
router.put('/availability', auth, authorize('vendor'), async (req, res) => {
  try {
    const { availability } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    vendor.availability = availability;
    await vendor.save();
    
    const populatedVendor = await Vendor.findById(vendor._id)
      .populate('user', 'name email');
    
    res.json(populatedVendor);
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add service (Vendor only)
router.post('/services', auth, authorize('vendor'), async (req, res) => {
  try {
    const { name, category, description, price } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    vendor.services.push({
      name,
      category,
      description,
      price
    });

    await vendor.save();
    
    const populatedVendor = await Vendor.findById(vendor._id)
      .populate('user', 'name email');
    
    res.json(populatedVendor);
  } catch (error) {
    console.error('Add service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove service (Vendor only)
router.delete('/services/:serviceId', auth, authorize('vendor'), async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    vendor.services = vendor.services.filter(
      service => service._id.toString() !== req.params.serviceId
    );

    await vendor.save();
    
    const populatedVendor = await Vendor.findById(vendor._id)
      .populate('user', 'name email');
    
    res.json(populatedVendor);
  } catch (error) {
    console.error('Remove service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
