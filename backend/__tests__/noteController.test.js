const { getNotes, createNote, updateNote, deleteNote } = require('../controllers/noteController');
const Note = require('../models/Note');
const logger = require('../utils/logger');

// Mock dependencies
jest.mock('../models/Note');
jest.mock('../utils/logger');

describe('Note Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      params: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getNotes', () => {
    it('should get all notes for a user successfully', async () => {
      // Arrange
      req.params.userId = 'user123';
      
      const mockNotes = [
        { _id: 'note1', text: 'Test note 1', tag: 'General', userId: 'user123', createdAt: new Date() },
        { _id: 'note2', text: 'Test note 2', tag: 'Work', userId: 'user123', createdAt: new Date() }
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockNotes)
      };

      Note.find.mockReturnValue(mockQuery);

      // Act
      await getNotes(req, res);

      // Assert
      expect(Note.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith([
        { id: 'note1', text: 'Test note 1', tag: 'General', createdAt: mockNotes[0].createdAt },
        { id: 'note2', text: 'Test note 2', tag: 'Work', createdAt: mockNotes[1].createdAt }
      ]);
    });

    it('should return 400 if userId is missing', async () => {
      // Arrange - no userId in params

      // Act
      await getNotes(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User ID is required'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.params.userId = 'user123';
      const error = new Error('Database error');
      
      Note.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(error)
      });

      // Act
      await getNotes(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error fetching notes'
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('createNote', () => {
    it('should create a new note successfully', async () => {
      // Arrange
      req.body = {
        text: 'New test note',
        tag: 'Personal',
        userId: 'user123'
      };

      const mockNote = {
        _id: 'note123',
        text: 'New test note',
        tag: 'Personal',
        userId: 'user123',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      Note.mockImplementation(() => mockNote);

      // Act
      await createNote(req, res);

      // Assert
      expect(mockNote.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        note: {
          id: 'note123',
          text: 'New test note',
          tag: 'Personal',
          createdAt: mockNote.createdAt
        }
      });
      expect(logger.info).toHaveBeenCalledWith('Note created for user user123: note123');
    });

    it('should use default tag if not provided', async () => {
      // Arrange
      req.body = {
        text: 'New test note',
        userId: 'user123'
      };

      const mockNote = {
        _id: 'note123',
        text: 'New test note',
        tag: 'General',
        userId: 'user123',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      Note.mockImplementation(() => mockNote);

      // Act
      await createNote(req, res);

      // Assert
      expect(mockNote.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        note: expect.objectContaining({
          tag: 'General'
        })
      });
    });

    it('should return 400 if text is missing', async () => {
      // Arrange
      req.body = {
        userId: 'user123'
      };

      // Act
      await createNote(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Text and userId are required'
      });
    });

    it('should return 400 if userId is missing', async () => {
      // Arrange
      req.body = {
        text: 'New test note'
      };

      // Act
      await createNote(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Text and userId are required'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.body = {
        text: 'New test note',
        userId: 'user123'
      };

      const error = new Error('Database error');
      Note.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error)
      }));

      // Act
      await createNote(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error creating note'
      });
      expect(logger.error).toHaveBeenCalledWith('Error creating note:', error);
    });
  });

  describe('updateNote', () => {
    it('should update a note successfully', async () => {
      // Arrange
      req.params.id = 'note123';
      req.body = {
        text: 'Updated note text',
        tag: 'Work'
      };

      const mockUpdatedNote = {
        _id: 'note123',
        text: 'Updated note text',
        tag: 'Work',
        createdAt: new Date()
      };

      Note.findByIdAndUpdate.mockResolvedValue(mockUpdatedNote);

      // Act
      await updateNote(req, res);

      // Assert
      expect(Note.findByIdAndUpdate).toHaveBeenCalledWith(
        'note123',
        { text: 'Updated note text', tag: 'Work' },
        { new: true, runValidators: true }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        note: {
          id: 'note123',
          text: 'Updated note text',
          tag: 'Work',
          createdAt: mockUpdatedNote.createdAt
        }
      });
      expect(logger.info).toHaveBeenCalledWith('Note updated: note123');
    });

    it('should return 400 if text is missing', async () => {
      // Arrange
      req.params.id = 'note123';
      req.body = {
        tag: 'Work'
      };

      // Act
      await updateNote(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Text is required'
      });
    });

    it('should return 404 if note not found', async () => {
      // Arrange
      req.params.id = 'nonexistent';
      req.body = {
        text: 'Updated text'
      };

      Note.findByIdAndUpdate.mockResolvedValue(null);

      // Act
      await updateNote(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Note not found'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.params.id = 'note123';
      req.body = {
        text: 'Updated text'
      };

      const error = new Error('Database error');
      Note.findByIdAndUpdate.mockRejectedValue(error);

      // Act
      await updateNote(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error updating note'
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteNote', () => {
    it('should delete a note successfully', async () => {
      // Arrange
      req.params.id = 'note123';

      const mockDeletedNote = {
        _id: 'note123',
        text: 'Deleted note'
      };

      Note.findByIdAndDelete.mockResolvedValue(mockDeletedNote);

      // Act
      await deleteNote(req, res);

      // Assert
      expect(Note.findByIdAndDelete).toHaveBeenCalledWith('note123');
      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(logger.info).toHaveBeenCalledWith('Note deleted: note123');
    });

    it('should return 404 if note not found', async () => {
      // Arrange
      req.params.id = 'nonexistent';

      Note.findByIdAndDelete.mockResolvedValue(null);

      // Act
      await deleteNote(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Note not found'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.params.id = 'note123';

      const error = new Error('Database error');
      Note.findByIdAndDelete.mockRejectedValue(error);

      // Act
      await deleteNote(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error deleting note'
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
