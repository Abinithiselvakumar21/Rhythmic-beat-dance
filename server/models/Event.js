const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    song: {
      type: String,
      default: '', // Name of the song / choreography track
    },
    instructor: {
      type: String,
      default: 'Rhythmic Beat Master Choreographer',
      trim: true,
    },
    level: {
      type: String,
      default: 'Open Level (Beginner & Intermediate)',
      trim: true,
    },
    agenda: {
      type: String,
      default: '', // Detailed workshop flow / what happens in session
    },
    duration: {
      type: String,
      default: '2.5 Hours Masterclass',
      trim: true,
    },
    location: {
      type: String,
      default: 'Valasaravakkam Studio, Chennai',
      trim: true,
    },
    inclusions: {
      type: String,
      default: '4K Cinematic Stage Video Shoot, Official Studio Certificate, Audio Track Access, Air-Conditioned Sprung Floor',
      trim: true,
    },
    requirements: {
      type: String,
      default: 'Comfortable dancewear or sweatpants, clean dance sneakers, personal water bottle',
      trim: true,
    },
    participants: {
      type: String,
      default: '',
      trim: true,
    },
    guestName: {
      type: String,
      default: '',
      trim: true,
    },
    specialActivities: {
      type: String,
      default: '',
      trim: true,
    },
    highlights: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
    },
    slots: {
      type: Number,
      default: 0,
      min: 0,
    },
    prize: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      default: '',
    },
    time: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
