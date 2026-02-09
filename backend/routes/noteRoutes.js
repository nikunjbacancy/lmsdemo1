const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const upload = require('../middleware/upload');

// GET all notes for a user
router.get('/:userId', noteController.getNotes);

// POST a new note with image
router.post('/', upload.single('image'), noteController.createNote);

// PUT update a note
router.put('/:id', noteController.updateNote);

// DELETE a note
router.delete('/:id', noteController.deleteNote);

// GET image from a note
router.get('/:noteId/image', noteController.getImage);

module.exports = router;
