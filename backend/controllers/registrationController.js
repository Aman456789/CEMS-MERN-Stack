const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { Parser } = require('json2csv');

const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, isDeleted: false });

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (event.status !== 'approved') {
    return res.status(400).json({
      success: false,
      message: 'Registrations are only open for approved events',
    });
  }

  const existingRegistration = await Registration.findOne({
    student: req.user._id,
    event: req.params.id,
  });

  if (existingRegistration) {
    return res.status(409).json({
      success: false,
      message: 'You have already registered for this event',
    });
  }

  const registration = await Registration.create({
    student: req.user._id,
    event: req.params.id,
  });

  await Notification.create({
    recipient: event.createdBy,
    event: event._id,
    type: 'new_registration',
    message: `${req.user.fullName} has requested to join "${event.title}".`,
  });

  res.status(201).json({ success: true, registration });
});

const getEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (
    req.user.role === 'organizer' &&
    event.createdBy.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view registrations for this event',
    });
  }

  const { status } = req.query;
  const filter = { event: req.params.id };
  if (status) filter.status = status;

  const registrations = await Registration.find(filter)
    .populate('student', 'fullName email club')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: registrations.length, registrations });
});

const updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { action, rejectedReason } = req.body;
  const validActions = ['approved', 'rejected'];

  if (!validActions.includes(action)) {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }

  const registration = await Registration.findById(req.params.regId).populate('event');

  if (!registration) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  if (
    req.user.role === 'organizer' &&
    registration.event.createdBy.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  if (registration.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Registration is already ${registration.status}`,
    });
  }

  registration.status = action;
  if (action === 'rejected' && rejectedReason) {
    registration.rejectedReason = rejectedReason;
  }
  await registration.save();

  const notifType = action === 'approved' ? 'registration_approved' : 'registration_rejected';
  const notifMessage =
    action === 'approved'
      ? `Your registration for "${registration.event.title}" has been approved!`
      : `Your registration for "${registration.event.title}" was not approved.`;

  await Notification.create({
    recipient: registration.student,
    event: registration.event._id,
    type: notifType,
    message: notifMessage,
  });

  res.status(200).json({ success: true, registration });
});

const exportAttendeesCSV = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (
    req.user.role === 'organizer' &&
    event.createdBy.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const approvedRegistrations = await Registration.find({
    event: req.params.id,
    status: 'approved',
  }).populate('student', 'fullName email club');

  const csvData = approvedRegistrations.map((r, index) => ({
    SrNo: index + 1,
    FullName: r.student.fullName,
    Email: r.student.email,
    Club: r.student.club || 'N/A',
    RegisteredAt: r.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  }));

  const parser = new Parser({
    fields: ['SrNo', 'FullName', 'Email', 'Club', 'RegisteredAt'],
  });
  const csv = parser.parse(csvData);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="attendees_${event.title.replace(/\s+/g, '_')}.csv"`
  );
  res.status(200).send(csv);
});

module.exports = {
  registerForEvent,
  getEventRegistrations,
  updateRegistrationStatus,
  exportAttendeesCSV,
};