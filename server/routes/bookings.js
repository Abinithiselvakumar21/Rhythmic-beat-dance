const express = require('express');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

const router = express.Router();

// Public: Create a new booking
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, eventId, eventTitle, slots, ticketId, date } = req.body;

    if (!name || !phone || !ticketId) {
      return res.status(400).json({ message: 'Name, phone, and ticket ID are required' });
    }

    const booking = await Booking.create({
      name,
      phone,
      email: email || '',
      eventId: eventId || '',
      eventTitle: eventTitle || '',
      slots: Number(slots) || 1,
      ticketId,
      date: date || '',
      status: 'Pending',
    });

    // Optionally decrement slots in Event if eventId is provided
    if (eventId) {
      try {
        const event = await Event.findById(eventId);
        if (event && event.slots > 0) {
          event.slots = Math.max(0, event.slots - (Number(slots) || 1));
          await event.save();
        }
      } catch (err) {
        console.error('Error auto-decrementing event slots:', err.message);
      }
    }

    res.status(201).json({
      message: 'Booking successfully created',
      booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      message: 'Unable to save booking to database',
      error: error.message,
    });
  }
});

// Admin: View all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch bookings' });
  }
});

// Admin: Update booking status (e.g. Confirmed / Cancelled)
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: 'Unable to update booking status' });
  }
});

// Admin: Delete a booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Unable to delete booking' });
  }
});

module.exports = router;
