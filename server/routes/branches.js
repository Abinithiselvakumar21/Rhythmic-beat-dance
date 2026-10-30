const express = require('express');
const Branch = require('../models/Branch');

const router = express.Router();

const DEFAULT_BRANCHES = [
  {
    name: 'Valasaravakkam Studio',
    tag: 'HEADQUARTERS & MAIN STAGE',
    address: '42, Arcot Road, Near Mega Mart, Valasaravakkam, Chennai - 600087',
    city: 'Chennai',
    phone: '+91 99947 16471',
    specs: [
      '1,800 sq.ft Wooden Spring Floor',
      '4K Stage Lighting & Video Setup',
      'Fully Air Conditioned',
      'Separate Changing Rooms & Lockers',
    ],
    status: 'Active',
  },
  {
    name: 'Kolapakkam Studio',
    tag: 'PRACTICE & CREW FLOOR',
    address: '15, VGN Boulevard, Near Max Hospital, Kolapakkam, Chennai - 600128',
    city: 'Chennai',
    phone: '+91 99947 16471',
    specs: [
      '1,200 sq.ft Rehearsal Hall',
      'Surround Acoustic Sound System',
      'Free Dancer Parking Facility',
      'Mirror Walls & Ambient Lighting',
    ],
    status: 'Active',
  },
  {
    name: 'Ambattur Masterclass Branch',
    tag: 'UPCOMING EXPANSION',
    address: 'MTH Road, Near Industrial Estate, Ambattur, Chennai - 600053',
    city: 'Chennai',
    phone: '+91 99947 16471',
    specs: [
      'Masterclass Arena & Cypher Zone',
      'Battle Stage & Audience Seating',
      'Capacity: 60+ Dancers',
    ],
    status: 'Launching Soon',
  },
];

// Public: Get all branches (auto-seed if empty)
router.get('/', async (req, res) => {
  try {
    let branches = await Branch.find().sort({ createdAt: 1 });

    if (!branches || branches.length === 0) {
      branches = await Branch.insertMany(DEFAULT_BRANCHES);
    }

    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    // Graceful fallback to default branches in case of DB connection issue
    res.json(DEFAULT_BRANCHES);
  }
});

// Admin: Create new branch
router.post('/', async (req, res) => {
  try {
    const { name, tag, address, city, phone, specs, status } = req.body;

    if (!name || !address) {
      return res.status(400).json({ message: 'Branch name and address are required' });
    }

    const branch = await Branch.create({
      name,
      tag: tag || 'Studio Branch',
      address,
      city: city || 'Chennai',
      phone: phone || '+91 99947 16471',
      specs: Array.isArray(specs)
        ? specs
        : typeof specs === 'string'
        ? specs.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      status: status || 'Active',
    });

    res.status(201).json(branch);
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(400).json({ message: 'Unable to create branch', error: error.message });
  }
});

// Admin: Update branch
router.put('/:id', async (req, res) => {
  try {
    const { name, tag, address, city, phone, specs, status } = req.body;

    const updatedSpecs = Array.isArray(specs)
      ? specs
      : typeof specs === 'string'
      ? specs.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const updateData = {
      ...(name && { name }),
      ...(tag !== undefined && { tag }),
      ...(address && { address }),
      ...(city && { city }),
      ...(phone && { phone }),
      ...(updatedSpecs && { specs: updatedSpecs }),
      ...(status && { status }),
    };

    const branch = await Branch.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json(branch);
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(400).json({ message: 'Unable to update branch', error: error.message });
  }
});

// Admin: Delete branch
router.delete('/:id', async (req, res) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(400).json({ message: 'Unable to delete branch', error: error.message });
  }
});

module.exports = router;
