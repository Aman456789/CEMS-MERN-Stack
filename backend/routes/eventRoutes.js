const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/eventController");

const { protect, authorize, optionalProtect } = require("../middleware/authmiddleware");
const { uploadBanner } = require("../utils/cloudinary");

router.get("/", optionalProtect, getEvents);

router.get("/my-events", protect, authorize("organizer", "super_admin"), getMyEvents);
router.get("/my-registrations-organizer", protect, authorize("organizer", "super_admin"), getOrganizerRegistrations);

router.get("/:id", optionalProtect, getEventById);

router.post(
  "/",
  protect,
  authorize("organizer", "super_admin"),
  uploadBanner,
  createEvent
);

router.put(
  "/:id",
  protect,
  authorize("organizer", "super_admin"),
  uploadBanner,
  updateEvent
);

router.delete(
  "/:id",
  protect,
  authorize("organizer", "super_admin"),
  deleteEvent
);

router.patch("/:id/approve", protect, authorize("super_admin"), approveEvent);
router.patch("/:id/reject", protect, authorize("super_admin"), rejectEvent);
router.patch("/:id/feature", protect, authorize("super_admin"), toggleFeatured);

router.post("/:id/register", protect, authorize("student"), registerForEvent);

router.get(
  "/:id/registrations",
  protect,
  authorize("organizer", "super_admin"),
  getEventRegistrations
);

router.patch(
  "/:id/registrations/:regId/:action",
  protect,
  authorize("organizer", "super_admin"),
  updateRegistrationStatus
);

router.get(
  "/:id/registrations/export",
  protect,
  authorize("organizer", "super_admin"),
  exportRegistrationsCSV
);

module.exports = router;