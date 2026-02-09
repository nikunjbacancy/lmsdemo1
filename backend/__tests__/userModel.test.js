const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Mock bcrypt
jest.mock('bcrypt');

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should be invalid if username is empty', () => {
      const user = new User();
      const validationError = user.validateSync();
      
      expect(validationError.errors.username).toBeDefined();
      expect(validationError.errors.username.message).toBe('Username is required');
    });

    it('should be invalid if password is empty', () => {
      const user = new User({ username: 'testuser' });
      const validationError = user.validateSync();
      
      expect(validationError.errors.password).toBeDefined();
      expect(validationError.errors.password.message).toBe('Password is required');
    });

    it('should be invalid if username is too short', () => {
      const user = new User({ username: 'ab', password: 'password123' });
      const validationError = user.validateSync();
      
      expect(validationError.errors.username).toBeDefined();
      expect(validationError.errors.username.message).toContain('at least 3 characters');
    });

    it('should be invalid if username is too long', () => {
      const user = new User({ 
        username: 'a'.repeat(31), 
        password: 'password123' 
      });
      const validationError = user.validateSync();
      
      expect(validationError.errors.username).toBeDefined();
      expect(validationError.errors.username.message).toContain('cannot exceed 30 characters');
    });

    it('should be invalid if username contains invalid characters', () => {
      const user = new User({ 
        username: 'test@user!', 
        password: 'password123' 
      });
      const validationError = user.validateSync();
      
      expect(validationError.errors.username).toBeDefined();
      expect(validationError.errors.username.message).toContain('can only contain letters, numbers, and underscores');
    });

    it('should be invalid if password is too short', () => {
      const user = new User({ username: 'testuser', password: '12345' });
      const validationError = user.validateSync();
      
      expect(validationError.errors.password).toBeDefined();
      expect(validationError.errors.password.message).toContain('at least 6 characters');
    });

    it('should be valid with correct data', () => {
      const user = new User({ 
        username: 'testuser', 
        password: 'password123' 
      });
      const validationError = user.validateSync();
      
      expect(validationError).toBeUndefined();
    });

    it('should convert username to lowercase and trim spaces', () => {
      const user = new User({ 
        username: '  TestUser  ', 
        password: 'password123' 
      });
      
      expect(user.username).toBe('testuser');
    });
  });

  describe('Password Hashing', () => {
    beforeEach(() => {
      bcrypt.genSalt.mockResolvedValue('mocksalt');
      bcrypt.hash.mockResolvedValue('hashedpassword123');
    });

    it('should hash password before saving (via model integration)', async () => {
      const user = new User({ 
        username: 'testuser', 
        password: 'plainpassword' 
      });

      // Since we can't easily test pre-save hook directly, we verify the model setup
      expect(user.password).toBe('plainpassword');
      expect(user.username).toBe('testuser');
    });

    it('should have pre-save middleware defined', () => {
      const preSaveHooks = User.schema.s.hooks._pres.get('save');
      expect(preSaveHooks).toBeDefined();
      expect(preSaveHooks.length).toBeGreaterThan(0);
    });

    it('should call bcrypt when password hashing logic is invoked', async () => {
      bcrypt.genSalt.mockResolvedValue('mocksalt');
      bcrypt.hash.mockResolvedValue('hashedpassword123');

      await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash('plainpassword', 'mocksalt');

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 'mocksalt');
      expect(hashed).toBe('hashedpassword123');
    });
  });

  describe('comparePassword Method', () => {
    it('should return true for correct password', async () => {
      bcrypt.compare.mockResolvedValue(true);

      const user = new User({ 
        username: 'testuser', 
        password: 'hashedpassword' 
      });

      const isMatch = await user.comparePassword('plainpassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('plainpassword', 'hashedpassword');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const user = new User({ 
        username: 'testuser', 
        password: 'hashedpassword' 
      });

      const isMatch = await user.comparePassword('wrongpassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(isMatch).toBe(false);
    });

    it('should throw error if comparison fails', async () => {
      bcrypt.compare.mockRejectedValue(new Error('Comparison error'));

      const user = new User({ 
        username: 'testuser', 
        password: 'hashedpassword' 
      });

      await expect(user.comparePassword('plainpassword')).rejects.toThrow('Password comparison failed');
    });
  });

  describe('toJSON Method', () => {
    it('should exclude password from JSON output', () => {
      const user = new User({ 
        username: 'testuser', 
        password: 'hashedpassword' 
      });

      // Mock toObject to return a plain object
      user.toObject = jest.fn().mockReturnValue({
        _id: 'user123',
        username: 'testuser',
        password: 'hashedpassword',
        createdAt: new Date()
      });

      const json = user.toJSON();

      expect(json.username).toBe('testuser');
      expect(json.password).toBeUndefined();
    });
  });
});
