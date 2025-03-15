/**
 * Format date to YYYY-MM-DD
 * @param {Date} date Date object
 * @returns {String} Formatted date string
 */
exports.formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Format time to HH:MM
   * @param {String} time Time string (HH:MM)
   * @returns {String} Formatted time string
   */
  exports.formatTime = (time) => {
    if (!time) return null;
    
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };
  
  /**
   * Get start and end of day
   * @param {Date} date Date object
   * @returns {Object} Object with start and end dates
   */
  exports.getDayBoundaries = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };
  
  /**
   * Calculate time difference in minutes
   * @param {String} startTime Start time (HH:MM)
   * @param {String} endTime End time (HH:MM)
   * @returns {Number} Difference in minutes
   */
  exports.getTimeDifferenceInMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  };
  
  /**
   * Check if time range overlaps with another time range
   * @param {String} start1 Start time 1 (HH:MM)
   * @param {String} end1 End time 1 (HH:MM)
   * @param {String} start2 Start time 2 (HH:MM)
   * @param {String} end2 End time 2 (HH:MM)
   * @returns {Boolean} True if overlaps, false otherwise
   */
  exports.timeRangesOverlap = (start1, end1, start2, end2) => {
    if (!start1 || !end1 || !start2 || !end2) return false;
    
    return (
      (start1 >= start2 && start1 < end2) ||
      (end1 > start2 && end1 <= end2) ||
      (start1 <= start2 && end1 >= end2)
    );
  };
  
  /**
   * Get day of week name
   * @param {Date} date Date object
   * @returns {String} Day of week name (lowercase)
   */
  exports.getDayOfWeek = (date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date(date).getDay()];
  };
  
  /**
   * Generate time slots based on start, end times and slot duration
   * @param {String} startTime Start time (HH:MM)
   * @param {String} endTime End time (HH:MM)
   * @param {Number} slotDurationMinutes Slot duration in minutes
   * @returns {Array} Array of time slots
   */
  exports.generateTimeSlots = (startTime, endTime, slotDurationMinutes = 60) => {
    const slots = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (
      currentHour < endHour || 
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const start = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Advance by slot duration
      currentMinute += slotDurationMinutes;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute %= 60;
      }
      
      // Skip if we've gone past the end time
      if (
        currentHour > endHour || 
        (currentHour === endHour && currentMinute > endMinute)
      ) {
        break;
      }
      
      const end = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      slots.push({
        startTime: start,
        endTime: end
      });
    }
    
    return slots;
  };
  
  /**
   * Parse date string to Date object
   * @param {String} dateString Date string
   * @returns {Date} Date object
   */
  exports.parseDate = (dateString) => {
    if (!dateString) return null;
    
    // Try to parse as ISO string
    const date = new Date(dateString);
    
    // Check if valid date
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  };
  
  /**
   * Get date range for a week
   * @param {Date} date Date object
   * @returns {Object} Object with start and end dates
   */
  exports.getWeekBoundaries = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    
    // Set to previous Sunday (or current day if Sunday)
    start.setDate(start.getDate() - (day === 0 ? 0 : day));
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };
  
  /**
   * Get date range for a month
   * @param {Date} date Date object
   * @returns {Object} Object with start and end dates
   */
  exports.getMonthBoundaries = (date) => {
    const start = new Date(date);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(date);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  };