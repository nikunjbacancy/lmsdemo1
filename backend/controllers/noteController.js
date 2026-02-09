const Note = require('../models/Note');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

/**
 * Transform note document to frontend format
 */
const transformNote = (note) => ({
  id: note._id,
  text: note.text,
  tag: note.tag,
  hasImage: note.image ? true : false,
  createdAt: note.createdAt
});

/**
 * Get all notes for a user
 */
const getNotes = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    const notes = await Note.find({ userId }).sort({ createdAt: -1 });
    const transformedNotes = notes.map(transformNote);
    
    res.json(transformedNotes);
  } catch (error) { 
    logger.error(`Error fetching notes for user ${req.params.userId}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching notes' 
    });
  }
};

/**
 * Create a new note
 */
const createNote = async (req, res) => {
  try {
    const { text, tag, userId } = req.body;
    
    if (!text || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Text and userId are required' 
      });
    }
    
    const note = new Note({
      text,
      tag: tag || 'General',
      userId
    });

    // Handle image if provided
    if (req.file) {
      note.image = req.file.filename;
    }
    
    await note.save();
    
    logger.info(`Note created for user ${userId}: ${note._id}`);
    
    res.json({ 
      success: true, 
      note: transformNote(note)
    });
  } catch (error) {
    logger.error('Error creating note:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating note' 
    });
  }
};

/**
 * Update an existing note
 */
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, tag } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Text is required' 
      });
    }
    
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { text, tag: tag || 'General' },
      { new: true, runValidators: true }
    );
    
    if (!updatedNote) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note not found' 
      });
    }
    
    logger.info(`Note updated: ${id}`);
    
    res.json({
      success: true,
      note: transformNote(updatedNote)
    });
  } catch (error) {
    logger.error(`Error updating note ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating note' 
    });
  }
};

/**
 * Delete a note
 */
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedNote = await Note.findByIdAndDelete(id);
    
    if (!deletedNote) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note not found' 
      });
    }
    
    logger.info(`Note deleted: ${id}`);
    
    res.json({ success: true });
  } catch (error) {
    logger.error(`Error deleting note ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting note' 
    });
  }
};

/**
 * Get image from a note
 */
const getImage = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const note = await Note.findById(noteId);
    
    if (!note || !note.image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    const filePath = path.join(__dirname, '../uploads', note.image);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image file not found'
      });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    logger.error('Error retrieving image:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving image'
    });
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getImage
};
