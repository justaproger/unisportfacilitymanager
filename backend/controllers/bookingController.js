const Booking = require('../models/Booking');
const Facility = require('../models/Facility');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
exports.getBookings = async (req, res, next) => {
  try {
    let query;

    // If user is admin, get all bookings
    if (req.user.role === 'admin') {
      query = Booking.find().populate({
        path: 'facility',
        select: 'name type',
        populate: {
          path: 'university',
          select: 'name'
        }
      }).populate({
        path: 'user',
        select: 'name email'
      });
    } else {
      // If regular user, get only their bookings
      query = Booking.find({ user: req.user.id }).populate({
        path: 'facility',
        select: 'name type',
        populate: {
          path: 'university',
          select: 'name'
        }
      });
    }

    // Add query parameters
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    if (req.query.date) {
      const date = new Date(req.query.date);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query.find({
        startTime: { $gte: startOfDay },
        endTime: { $lte: endOfDay }
      });
    }

    // Sort by date
    query = query.sort({ startTime: 1 });

    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'facility',
        select: 'name type',
        populate: {
          path: 'university',
          select: 'name'
        }
      })
      .populate({
        path: 'user',
        select: 'name email'
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${req.params.id}`
      });
    }

    // Make sure user is booking owner or admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to access this booking`
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create booking
// @route   POST /api/facilities/:facilityId/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    req.body.facility = req.params.facilityId;
    req.body.user = req.user.id;

    const facility = await Facility.findById(req.params.facilityId);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: `No facility found with id ${req.params.facilityId}`
      });
    }

    // Validate booking times
    const { startTime, endTime } = req.body;
    
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check if end time is after start time
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Calculate duration in hours
    const durationHours = (end - start) / (1000 * 60 * 60);
    
    // Calculate total price
    req.body.totalPrice = facility.pricePerHour * durationHours;

    const booking = await Booking.create(req.body);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${req.params.id}`
      });
    }

    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this booking`
      });
    }

    // If updating times, recalculate total price
    if (req.body.startTime && req.body.endTime) {
      const facility = await Facility.findById(booking.facility);
      
      const start = new Date(req.body.startTime);
      const end = new Date(req.body.endTime);
      
      // Check if end time is after start time
      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
      
      // Calculate duration in hours
      const durationHours = (end - start) / (1000 * 60 * 60);
      
      // Calculate total price
      req.body.totalPrice = facility.pricePerHour * durationHours;
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${req.params.id}`
      });
    }

    // Make sure user is booking owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to cancel this booking`
      });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled'
      });
    }

    // Update status to cancelled
    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status by admin
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status'
      });
    }

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${req.params.id}`
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    if (!paymentStatus || !['pending', 'paid', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid payment status'
      });
    }

    if (paymentStatus === 'paid' && (!paymentMethod || !['credit_card', 'cash', 'bank_transfer', 'free'].includes(paymentMethod))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid payment method'
      });
    }

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking found with id ${req.params.id}`
      });
    }

    booking.paymentStatus = paymentStatus;
    
    if (paymentMethod) {
      booking.paymentMethod = paymentMethod;
    }
    
    if (paymentStatus === 'paid') {
      booking.paymentDate = Date.now();
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};