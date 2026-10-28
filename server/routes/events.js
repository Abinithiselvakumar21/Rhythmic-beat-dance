
const express = require('express');
const Event = require('../models/Event');
const verifyAdmin = require('../middleware/auth');

const router = express.Router();

// Public: view all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch events' });
  }
});

// Admin only: create event
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({
      message: 'Unable to create event',
      error: error.message
    });
  }
});

// Admin only: edit event
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: 'Unable to update event' });
  }
});

// Admin only: delete event
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Unable to delete event' });
  }
});

module.exports = router;
