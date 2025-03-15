const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: [true, 'Facility ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  slots: [{
    startTime: {
      type: String,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required']
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    // If slot is unavailable due to special reason (not booking)
    unavailableReason: {
      type: String,
      enum: ['maintenance', 'holiday', 'special_event', 'closure', null],
      default: null
    }
  }],
  isHoliday: {
    type: Boolean,
    default: false
  },
  specialHours: {
    isSpecial: {
      type: Boolean,
      default: false
    },
    open: String,
    close: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of facility+date
ScheduleSchema.index({ facility: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);