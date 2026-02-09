const mongoose = require('mongoose');
const Note = require('../models/Note');

describe('Note Model', () => {
  describe('Schema Validation', () => {
    it('should be invalid if text is empty', () => {
      const note = new Note({ userId: 'user123' });
      const validationError = note.validateSync();
      
      expect(validationError.errors.text).toBeDefined();
      expect(validationError.errors.text.message).toBe('Note text is required');
    });

    it('should be invalid if userId is empty', () => {
      const note = new Note({ text: 'Test note' });
      const validationError = note.validateSync();
      
      expect(validationError.errors.userId).toBeDefined();
      expect(validationError.errors.userId.message).toBe('User ID is required');
    });

    it('should be invalid if text exceeds max length', () => {
      const note = new Note({ 
        text: 'a'.repeat(10001), 
        userId: 'user123' 
      });
      const validationError = note.validateSync();
      
      expect(validationError.errors.text).toBeDefined();
      expect(validationError.errors.text.message).toContain('cannot exceed 10000 characters');
    });

    it('should be invalid if tag is not in enum values', () => {
      const note = new Note({ 
        text: 'Test note', 
        tag: 'InvalidTag',
        userId: 'user123' 
      });
      const validationError = note.validateSync();
      
      expect(validationError.errors.tag).toBeDefined();
      expect(validationError.errors.tag.message).toContain('is not a valid tag');
    });

    it('should be valid with correct data', () => {
      const note = new Note({ 
        text: 'Test note', 
        tag: 'Work',
        userId: new mongoose.Types.ObjectId()
      });
      const validationError = note.validateSync();
      
      expect(validationError).toBeUndefined();
    });

    it('should use default tag "General" if not provided', () => {
      const note = new Note({ 
        text: 'Test note', 
        userId: 'user123' 
      });
      
      expect(note.tag).toBe('General');
    });

    it('should trim text whitespace', () => {
      const note = new Note({ 
        text: '  Test note with spaces  ', 
        userId: 'user123' 
      });
      
      expect(note.text).toBe('Test note with spaces');
    });

    it('should accept all valid tag values', () => {
      const validTags = ['General', 'Gym', 'Food', 'Bills', 'Work', 'Shopping', 'Personal', 'Private'];
      
      validTags.forEach(tag => {
        const note = new Note({ 
          text: 'Test note', 
          tag: tag,
          userId: new mongoose.Types.ObjectId()
        });
        const validationError = note.validateSync();
        
        expect(validationError).toBeUndefined();
        expect(note.tag).toBe(tag);
      });
    });
  });

  describe('Virtual Properties', () => {
    it('should have formattedDate virtual', () => {
      const testDate = new Date('2026-02-02T10:00:00Z');
      const note = new Note({ 
        text: 'Test note', 
        userId: 'user123',
        createdAt: testDate
      });
      
      expect(note.formattedDate).toBe(testDate.toLocaleDateString());
    });
  });

  describe('toJSON Method', () => {
    it('should transform _id to id', () => {
      const noteId = new mongoose.Types.ObjectId();
      const testDate = new Date('2026-02-02T10:00:00Z');
      const note = new Note({ 
        _id: noteId,
        text: 'Test note', 
        userId: new mongoose.Types.ObjectId(),
        createdAt: testDate
      });

      const json = note.toJSON();
      
      expect(json.id).toEqual(noteId);
      expect(json._id).toBeUndefined();
    });

    it('should exclude __v from JSON output', () => {
      const testDate = new Date('2026-02-02T10:00:00Z');
      const note = new Note({ 
        text: 'Test note', 
        userId: new mongoose.Types.ObjectId(),
        createdAt: testDate
      });

      const json = note.toJSON();
      
      expect(json.__v).toBeUndefined();
    });

    it('should include virtuals in JSON output', () => {
      const testDate = new Date('2026-02-02T10:00:00Z');
      const note = new Note({ 
        text: 'Test note', 
        userId: 'user123',
        createdAt: testDate
      });

      const json = note.toJSON();
      
      expect(json.formattedDate).toBeDefined();
      expect(json.formattedDate).toBe(testDate.toLocaleDateString());
    });
  });

  describe('Indexes', () => {
    it('should have compound index on userId and createdAt', () => {
      const indexes = Note.schema.indexes();
      const compoundIndex = indexes.find(index => 
        index[0].userId && index[0].createdAt
      );
      
      expect(compoundIndex).toBeDefined();
      expect(compoundIndex[0].userId).toBe(1);
      expect(compoundIndex[0].createdAt).toBe(-1);
    });

    it('should have index on userId field', () => {
      const userIdField = Note.schema.path('userId');
      
      expect(userIdField.options.index).toBe(true);
    });
  });

  describe('Schema Options', () => {
    it('should have timestamps enabled', () => {
      expect(Note.schema.options.timestamps).toBe(true);
    });

    it('should have createdAt and updatedAt in schema paths', () => {
      expect(Note.schema.paths.createdAt).toBeDefined();
      expect(Note.schema.paths.updatedAt).toBeDefined();
    });
  });
});
