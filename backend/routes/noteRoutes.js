const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const upload = require('../middleware/upload');

// POST a new note with image
router.post('/', upload.single('image'), noteController.createNote);

// GET image from a note (must come before /:userId to avoid matching issues)
router.get('/:noteId/image', noteController.getImage);

// GET all notes for a user
router.get('/:userId', noteController.getNotes);

// PUT update a note
router.put('/:id', noteController.updateNote);

// DELETE a note
router.delete('/:id', noteController.deleteNote);

module.exports = router;
