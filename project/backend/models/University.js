const mongoose = require('mongoose');

const UniversitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'University name is required'],
    trim: true,
    unique: true
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State/Province is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip/Postal code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    }
  },
  contact: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        'Please enter a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required']
    },
    website: {
      type: String
    }
  },
  logo: {
    type: String,
    default: 'default-university-logo.png'
  },
  administrators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for facilities
UniversitySchema.virtual('facilities', {
  ref: 'Facility',
  localField: '_id',
  foreignField: 'university',
  justOne: false
});

module.exports = mongoose.model('University', UniversitySchema);