const mongoose = require('mongoose');

const FacilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Facility name is required'],
    trim: true
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'University',
    required: [true, 'University is required']
  },
  type: {
    type: String,
    required: [true, 'Facility type is required'],
    enum: [
      'football_field',
      'basketball_court',
      'tennis_court',
      'swimming_pool',
      'gym',
      'track_field',
      'volleyball_court',
      'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  images: [{
    type: String
  }],
  capacity: {
    type: Number,
    required: [true, 'Capacity is required']
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'RUB', 'JPY', 'CNY', 'AUD']
  },
  location: {
    building: String,
    floor: String,
    roomNumber: String
  },
  amenities: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  operatingHours: {
    monday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
      isOpen: { type: Boolean, default: true }
    },
    tuesday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
      isOpen: { type: Boolean, default: true }
    },
    wednesday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
      isOpen: { type: Boolean, default: true }
    },
    thursday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
      isOpen: { type: Boolean, default: true }
    },
    friday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
      isOpen: { type: Boolean, default: true }
    },
    saturday: {
      open: { type: String, default: '10:00' },
      close: { type: String, default: '20:00' },
      isOpen: { type: Boolean, default: true }
    },
    sunday: {
      open: { type: String, default: '10:00' },
      close: { type: String, default: '20:00' },
      isOpen: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for schedule slots
FacilitySchema.virtual('scheduleSlots', {
  ref: 'Schedule',
  localField: '_id',
  foreignField: 'facility',
  justOne: false
});

// Virtual for bookings
FacilitySchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'facility',
  justOne: false
});

module.exports = mongoose.model('Facility', FacilitySchema);