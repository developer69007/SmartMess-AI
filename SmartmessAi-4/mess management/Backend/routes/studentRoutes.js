// routes/studentRoutes.js
// -----------------------------------------------------------------------------
// This file defines the URL endpoints for everything related to a Student,
// and decides WHO is allowed to hit each one using two middlewares:
//
//   protect            -> "Are you logged in at all?" (checks the JWT)
//   authorize(...roles) -> "Is your role allowed to do THIS specific thing?"
//
// Middlewares run left-to-right, in the order you list them. So:
//   router.get('/', protect, authorize("admin"), getAllStudents)
// means: first run protect, THEN authorize, THEN (if both pass) getAllStudents.
// If protect or authorize fails, they respond with an error and getAllStudents
// never even runs.
// -----------------------------------------------------------------------------

const express = require('express');
const router = express.Router();

const {
  createStudent,
  loginStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getProfile,
  firebaseAuthBridge,
} = require('../controllers/studentController');

// IMPORTANT: you must import BOTH protect and authorize from authMiddleware.
// Before, only `protect` was imported, which is why `authorize` crashed
// with "authorize is not defined" the moment this file ran.
const { protect, authorize } = require('../middleware/authMiddleware');

// -----------------------------------------------------------------------------
// IMPORTANT: '/profile' must be declared BEFORE '/:id'
// Otherwise Express will match '/profile' as an :id param and hit
// getStudentById instead. Express matches routes top-to-bottom, first match
// wins, so more "specific" routes always need to go above generic ones like
// '/:id'.
// -----------------------------------------------------------------------------
router.get('/profile', protect, getProfile);

// -----------------------------------------------------------------------------
// Create a new student
// This is usually your "register / sign up" route, so it's normally left
// PUBLIC (no protect) — a brand-new user doesn't have a token yet to prove
// who they are. If you actually want only an admin to be able to create
// students (e.g. no public sign-up), add protect + authorize("admin") here
// instead.
// -----------------------------------------------------------------------------
router.post('/', createStudent);

// -----------------------------------------------------------------------------
// Login
// Public — a user needs to be able to log in before they have a token.
// -----------------------------------------------------------------------------
router.post('/login', loginStudent);
router.post('/firebase-login', firebaseAuthBridge);

// -----------------------------------------------------------------------------
// Get all students
// This exposes a list of every student in the system, so it should NOT be
// public. Only staff and admins should be able to see the full list.
// -----------------------------------------------------------------------------
router.get('/', protect, authorize("staff", "admin"), getAllStudents);

// -----------------------------------------------------------------------------
// Get one student by ID
// Same reasoning — staff and admins can look up individual student records.
// (Students look up their OWN data via '/profile' above, not this route.)
// -----------------------------------------------------------------------------
router.get('/:id', protect, authorize("staff", "admin"), getStudentById);

// -----------------------------------------------------------------------------
// Update a student
// Editing records is sensitive — restrict it to admins only. If you want
// staff to be able to edit too, just add "staff" to the list, e.g.
// authorize("staff", "admin").
// -----------------------------------------------------------------------------
router.put('/:id', protect, authorize("admin"), updateStudent);

// -----------------------------------------------------------------------------
// Delete a student
// This is the most destructive action, so it's locked to admins ONLY.
// NOTE: there was previously a duplicate/broken delete route below this one
// (using a wrong path AND a function that didn't exist). That line has been
// removed — this single route is now the only delete route.
// -----------------------------------------------------------------------------
router.delete('/:id', protect, authorize("admin"), deleteStudent);

module.exports = router;