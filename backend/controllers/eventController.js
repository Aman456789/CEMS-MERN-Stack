const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { uploadToCloudinary } = require('../utils/cloudinary');

const detectConflict = async (venue, startTime, endTime, excludeId = null) => {
  const normalizedVenue = venue.trim().toUpperCase();

  const query = {
    venue: normalizedVenue,
    status: { $in: ['pending', 'approved'] },
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return await Event.findOne(query).select('title venue startTime endTime status');
};

const createEvent = asyncHandler(async (req, res) => {
  const {
    title, description, venue, date,
    startTime, endTime, category, capacity,
    department, registrationDeadline, club
  } = req.body;

  if (!title || !description || !venue || !date || !startTime || !endTime) {
    res.status(400);
    throw new Error('Title, description, venue, date, start time, and end time are required.');
  }

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    res.status(400);
    throw new Error('Invalid start time or end time format. Please use ISO 8601 format.');
  }

  if (endDate <= startDate) {
    res.status(400);
    throw new Error('End time must be strictly after start time.');
  }

  if (startDate <= new Date()) {
    res.status(400);
    throw new Error('Events cannot be scheduled in the past. Please select a future date and time.');
  }

  const conflictingEvent = await detectConflict(venue, startDate, endDate);

  if (conflictingEvent) {
    res.status(409); 
    throw new Error(
      `Venue conflict detected. "${conflictingEvent.title}" is already booked at ` +
      `"${conflictingEvent.venue}" from ` +
      `${new Date(conflictingEvent.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} to ` +
      `${new Date(conflictingEvent.endTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}. ` +
      `Please choose a different venue or time slot.`
    );
  }

  let imageUrl = null;
  if (req.file) {
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      'cems/events' 
    );
    imageUrl = uploadResult.secure_url;
  }

  const event = await Event.create({
    title: title.trim(),
    description: description.trim(),
    venue,
    date: new Date(date),
    startTime: startDate,
    endTime: endDate,
    imageUrl,
    createdBy: req.user._id, 
    status: 'pending',        
    category: category || 'other',
    club: club?.trim() || null,
    capacity: capacity ? parseInt(capacity, 10) : null,
    department: department?.trim() || null,
    registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
  });

  await event.populate('createdBy', 'fullName email department');

  res.status(201).json({
    success: true,
    message: 'Event proposal submitted successfully. It is now pending Super Admin approval.',
    event,
  });
});

const getEvents = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 12, search, category, status,
    dateFrom, dateTo, sortBy = 'date', sortOrder = 'asc',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  let filter = {};

  if (!req.user) {
    filter.status = 'approved';
    filter.date = { $gte: new Date() };
  } else if (req.user.role === 'student') {
    filter.status = 'approved';
    filter.date = { $gte: new Date() };
  } else if (req.user.role === 'organizer') {
    filter.$or = [
      { status: 'approved' },
      { createdBy: req.user._id },
    ];
  }

  if (req.user?.role === 'super_admin' && status) {
    filter.status = status;
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    const searchFilter = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { venue: searchRegex },
        { department: searchRegex },
      ],
    };
    
    if (filter.$or) {
      filter = { $and: [filter, searchFilter] };
    } else {
      Object.assign(filter, searchFilter);
    }
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  const sortOptions = {};
  const validSortFields = ['date', 'createdAt', 'title'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
  sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;

  const [events, totalCount] = await Promise.all([
    Event.find(filter)
      .populate('createdBy', 'fullName email department') 
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum),
    Event.countDocuments(filter),
  ]);

  const eventIds = events.map((e) => e._id);
  const registrationCounts = await Registration.aggregate([
    { $match: { event: { $in: eventIds }, status: 'approved' } },
    { $group: { _id: '$event', count: { $sum: 1 } } },
  ]);

  const countMap = registrationCounts.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {});

  const eventsWithCount = events.map((event) => ({
    ...event.toJSON(),
    registrationCount: countMap[event._id.toString()] || 0,
  }));

  res.status(200).json({
    success: true,
    totalCount,
    page: pageNum,
    totalPages: Math.ceil(totalCount / limitNum),
    events: eventsWithCount,
  });
});

const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    'createdBy',
    'fullName email department avatarUrl'
  );

  if (!event) {
    res.status(404);
    throw new Error('Event not found.');
  }

  let userRegistration = null;
  if (req.user?.role === 'student') {
    userRegistration = await Registration.findOne({
      student: req.user._id,
      event: event._id,
    }).select('status createdAt');
  }

  let registrationCount = 0;
  if (Registration.getEventRegistrationCount) {
     registrationCount = await Registration.getEventRegistrationCount(event._id);
  } else {
     registrationCount = await Registration.countDocuments({ event: event._id, status: 'approved' });
  }

  res.status(200).json({
    success: true,
    event: {
      ...event.toJSON(),
      registrationCount,
      userRegistration, 
    },
  });
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found.');
  }

  if (
    req.user.role === 'organizer' &&
    event.createdBy.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Access denied. You can only edit events that you created.');
  }

  const {
    title, description, venue, date,
    startTime, endTime, category, capacity,
    department, registrationDeadline,
  } = req.body;

  const effectiveVenue = venue || event.venue;
  const effectiveStart = startTime ? new Date(startTime) : event.startTime;
  const effectiveEnd = endTime ? new Date(endTime) : event.endTime;

  const scheduleChanged =
    (venue && venue.trim().toUpperCase() !== event.venue) ||
    (startTime && new Date(startTime).getTime() !== event.startTime.getTime()) ||
    (endTime && new Date(endTime).getTime() !== event.endTime.getTime());

  if (scheduleChanged) {
    if (effectiveEnd <= effectiveStart) {
      res.status(400);
      throw new Error('End time must be strictly after start time.');
    }

    const conflictingEvent = await detectConflict(
      effectiveVenue,
      effectiveStart,
      effectiveEnd,
      event._id
    );

    if (conflictingEvent) {
      res.status(409);
      throw new Error(
        `Venue conflict detected. "${conflictingEvent.title}" is already booked at ` +
        `"${conflictingEvent.venue}" from ` +
        `${new Date(conflictingEvent.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} to ` +
        `${new Date(conflictingEvent.endTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.`
      );
    }
  }

  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'cems/events');
    event.imageUrl = uploadResult.secure_url;
  }

  if (title) event.title = title.trim();
  if (description) event.description = description.trim();
  if (venue) event.venue = venue; 
  if (date) event.date = new Date(date);
  if (startTime) event.startTime = new Date(startTime);
  if (endTime) event.endTime = new Date(endTime);
  if (category) event.category = category;
  if (capacity !== undefined) event.capacity = capacity ? parseInt(capacity, 10) : null;
  if (department !== undefined) event.department = department?.trim() || null;
  if (registrationDeadline !== undefined)
    event.registrationDeadline = registrationDeadline ? new Date(registrationDeadline) : null;

  if (req.user.role === 'organizer' && event.status === 'approved' && scheduleChanged) {
    event.status = 'pending';
  }

  const updatedEvent = await event.save();
  await updatedEvent.populate('createdBy', 'fullName email');

  res.status(200).json({
    success: true,
    message: 'Event updated successfully.',
    event: updatedEvent,
  });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found.');
  }

  if (
    req.user.role === 'organizer' &&
    event.createdBy.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Access denied. You can only delete events that you created.');
  }

  await Registration.deleteMany({ event: event._id });
  await Event.findByIdAndDelete(event._id);

  res.status(200).json({
    success: true,
    message: `Event "${event.title}" and all associated registrations have been deleted.`,
  });
});

const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { status: 'approved' },
    { new: true, runValidators: true }
  ).populate('createdBy', 'fullName email');

  if (!event) {
    res.status(404);
    throw new Error('Event not found.');
  }

  res.status(200).json({
    success: true,
    message: `Event "${event.title}" has been approved.`,
    event,
  });
});

const rejectEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true, runValidators: true }
  ).populate('createdBy', 'fullName email');

  if (!event) {
    res.status(404);
    throw new Error('Event not found.');
  }

  res.status(200).json({
    success: true,
    message: `Event "${event.title}" has been rejected.`,
    event,
  });
});

const toggleFeatured = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found.');
    }
    event.isFeatured = !event.isFeatured;
    await event.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: `Event "${event.title}" featured status set to ${event.isFeatured}.`,
      event,
    });
});

const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const studentId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const existingRegistration = await Registration.findOne({
      student: studentId,
      event: eventId,
    });

    if (existingRegistration) {
      return res.status(400).json({ success: false, message: 'You are already registered for this event.' });
    }

    if (event.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Registrations are not open for this event yet.' });
    }

    if (event.capacity) {
      let currentApproved = 0;
      if (Registration.getEventRegistrationCount) {
        currentApproved = await Registration.getEventRegistrationCount(event._id);
      } else {
        currentApproved = await Registration.countDocuments({ event: event._id, status: 'approved' });
      }

      if (currentApproved >= event.capacity) {
        return res.status(400).json({ success: false, message: `This event has reached its maximum capacity of ${event.capacity} participants.` });
      }
    }

    const registration = await Registration.create({
      student: studentId,
      event: eventId,
      status: 'pending',
    });

    res.status(200).json({ success: true, message: 'Successfully registered for the event!', registration });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

const getEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found.');
  }

  if (
    req.user.role === 'organizer' &&
    event.createdBy.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Access denied. This is not your event.');
  }

  const filter = { event: event._id };
  if (req.query.status) filter.status = req.query.status;

  const registrations = await Registration.find(filter)
    .populate('student', 'fullName email rollNumber department avatarUrl')
    .populate('processedBy', 'fullName')
    .sort({ createdAt: -1 });

  const summary = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === 'pending').length,
    approved: registrations.filter((r) => r.status === 'approved').length,
    rejected: registrations.filter((r) => r.status === 'rejected').length,
  };

  res.status(200).json({
    success: true,
    event: { _id: event._id, title: event.title, capacity: event.capacity },
    summary,
    registrations,
  });
});

const updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { status, organizerNote } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'approved' or 'rejected'.");
  }

  const registration = await Registration.findById(req.params.regId).populate(
    'event',
    'createdBy title capacity'
  );

  if (!registration) {
    res.status(404);
    throw new Error('Registration not found.');
  }

  if (
    req.user.role === 'organizer' &&
    registration.event.createdBy.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Access denied. This registration is not for your event.');
  }

  if (status === 'approved' && registration.event.capacity) {
      let currentApproved = 0;
      if(Registration.getEventRegistrationCount) {
          currentApproved = await Registration.getEventRegistrationCount(registration.event._id);
      } else {
          currentApproved = await Registration.countDocuments({ event: registration.event._id, status: 'approved' });
      }

    if (currentApproved >= registration.event.capacity) {
      res.status(400);
      throw new Error(`Cannot approve. Event capacity (${registration.event.capacity}) has already been reached.`);
    }
  }

  registration.status = status;
  registration.processedBy = req.user._id;
  if (organizerNote) registration.organizerNote = organizerNote.trim();

  await registration.save();
  await registration.populate('student', 'fullName email');

  res.status(200).json({
    success: true,
    message: `Registration has been ${status}.`,
    registration,
  });
});

const exportRegistrationsCSV = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found.');
  }

  if (
    req.user.role === 'organizer' &&
    event.createdBy.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Access denied. This is not your event.');
  }

  const registrations = await Registration.find({
    event: event._id,
    status: 'approved',
  })
    .populate('student', 'fullName email rollNumber department')
    .sort({ createdAt: 1 }); 

  if (registrations.length === 0) {
    res.status(404);
    throw new Error('No approved registrations found for this event to export.');
  }

  const eventDate = new Date(event.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

  const headers = [
    '"Sr. No."', '"Full Name"', '"Email Address"', '"Roll Number"',
    '"Department"', '"Registration Date"', '"Status"',
  ];

  const rows = registrations.map((reg, index) => {
    const escape = (val) => `"${String(val || 'N/A').replace(/"/g, '""')}"`;
    return [
      escape(index + 1),
      escape(reg.student.fullName),
      escape(reg.student.email),
      escape(reg.student.rollNumber),
      escape(reg.student.department),
      escape(new Date(reg.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })),
      escape('Approved'),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const safeTitle = event.title.replace(/[^a-zA-Z0-9_]/g, '_'); 
  const filename = `CEMS_Attendees_${safeTitle}_${eventDate.replace(/\//g, '-')}.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send('\uFEFF' + csvContent);
});

const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ createdBy: req.user._id })
    .populate('createdBy', 'fullName email department')
    .sort({ createdAt: -1 });

  const eventIds = events.map((e) => e._id);
  const registrationCounts = await Registration.aggregate([
    { $match: { event: { $in: eventIds }, status: 'approved' } },
    { $group: { _id: '$event', count: { $sum: 1 } } },
  ]);

  const countMap = registrationCounts.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {});

  const eventsWithCount = events.map((event) => ({
    ...event.toJSON(),
    registrations: countMap[event._id.toString()] || 0,
  }));

  res.status(200).json({
    success: true,
    events: eventsWithCount,
  });
});

const getOrganizerRegistrations = asyncHandler(async (req, res) => {
  const myEvents = await Event.find({ createdBy: req.user._id }).select('_id title');
  const eventIds = myEvents.map((e) => e._id);

  const registrations = await Registration.find({
    event: { $in: eventIds },
    status: 'pending',
  })
    .populate('student', 'fullName email rollNumber department')
    .populate('event', 'title')
    .sort({ createdAt: -1 });

  const formatted = registrations.map((reg) => ({
    _id: reg._id,
    studentName: reg.student?.fullName || 'Student',
    email: reg.student?.email || '',
    eventTitle: reg.event?.title || 'Event',
    status: reg.status,
    createdAt: reg.createdAt,
  }));

  res.status(200).json({
    success: true,
    registrations: formatted,
  });
});

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
  toggleFeatured,
  registerForEvent,
  getEventRegistrations,
  updateRegistrationStatus,
  exportRegistrationsCSV,
  getMyEvents,
  getOrganizerRegistrations,
};