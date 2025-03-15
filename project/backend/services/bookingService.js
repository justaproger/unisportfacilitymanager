const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');

/**
 * Calculate total price based on hourly rate and duration
 * @param {Number} pricePerHour Facility price per hour
 * @param {Number} durationMinutes Duration in minutes
 * @returns {Number} Total price
 */
exports.calculateTotalPrice = (pricePerHour, durationMinutes) => {
  // Convert duration to hours
  const durationHours = durationMinutes / 60;
  // Calculate total price
  return parseFloat((pricePerHour * durationHours).toFixed(2));
};

/**
 * Check if a time slot is available for booking
 * @param {String} facilityId Facility ID
 * @param {Date} date Booking date
 * @param {String} startTime Start time (HH:MM)
 * @param {String} endTime End time (HH:MM)
 * @returns {Boolean} True if available, false otherwise
 */
exports.checkAvailability = async (facilityId, date, startTime, endTime) => {
  try {
    // Format date to midnight
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    
    // Check if there's a schedule for this date
    const schedule = await Schedule.findOne({
      facility: facilityId,
      date: bookingDate
    });
    
    // If there's a schedule with special rules
    if (schedule) {
      // Check if any slot overlaps with the requested time
      const overlappingSlots = schedule.slots.filter(slot => {
        return (
          (startTime >= slot.startTime && startTime < slot.endTime) ||
          (endTime > slot.startTime && endTime <= slot.endTime) ||
          (startTime <= slot.startTime && endTime >= slot.endTime)
        );
      });
      
      // Check if all overlapping slots are available
      if (overlappingSlots.length === 0 || overlappingSlots.some(slot => !slot.isAvailable)) {
        return false;
      }
    }
    
    // Check for existing bookings that overlap with the requested time
    const existingBookings = await Booking.find({
      facility: facilityId,
      date: {
        $gte: bookingDate,
        $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $in: ['pending', 'confirmed'] }
    });
    
    // Check if any existing booking overlaps with the requested time
    const hasOverlap = existingBookings.some(booking => {
      return (
        (startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime)
      );
    });
    
    return !hasOverlap;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

/**
 * Update schedule slots based on bookings
 * @param {String} facilityId Facility ID
 * @param {Date} date Schedule date
 */
exports.updateScheduleSlots = async (facilityId, date) => {
  try {
    // Format date to midnight
    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0);
    
    // Get schedule for this date
    const schedule = await Schedule.findOne({
      facility: facilityId,
      date: scheduleDate
    });
    
    if (!schedule) {
      return;
    }
    
    // Get all bookings for this date
    const bookings = await Booking.find({
      facility: facilityId,
      date: {
        $gte: scheduleDate,
        $lt: new Date(scheduleDate.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $in: ['pending', 'confirmed'] }
    });
    
    // Update slot availability based on bookings
    schedule.slots = schedule.slots.map(slot => {
      const isBooked = bookings.some(booking => {
        return (
          (booking.startTime <= slot.startTime && booking.endTime > slot.startTime) ||
          (booking.startTime < slot.endTime && booking.endTime >= slot.endTime) ||
          (booking.startTime >= slot.startTime && booking.endTime <= slot.endTime)
        );
      });
      
      // Don't override if slot was already marked as unavailable for other reasons
      if (!slot.isAvailable) {
        return slot;
      }
      
      slot.isAvailable = !isBooked;
      return slot;
    });
    
    await schedule.save();
  } catch (error) {
    console.error('Error updating schedule slots:', error);
    throw error;
  }
};

/**
 * Generate QR code data for booking
 * @param {Object} booking Booking object
 * @returns {Object} QR code data
 */
exports.generateQRCodeData = (booking) => {
  return {
    bookingId: booking._id,
    bookingCode: booking.bookingCode,
    facilityId: booking.facility,
    userId: booking.user,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    timestamp: new Date().toISOString()
  };
};

/**
 * Check if user is allowed to book the facility
 * @param {String} userId User ID
 * @param {String} facilityId Facility ID
 * @returns {Boolean} True if allowed, false otherwise
 */
exports.canUserBook = async (userId, facilityId) => {
  // Add any business rules here, such as:
  // - Check if user has outstanding payments
  // - Check if user has reached booking limit
  // - Check if user is banned from the facility
  
  // For now, always return true
  return true;
};