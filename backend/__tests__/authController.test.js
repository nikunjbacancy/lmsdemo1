const { register, login } = require('../controllers/authController');
const User = require('../models/User');
const logger = require('../utils/logger');

// Mock dependencies
jest.mock('../models/User');
jest.mock('../utils/logger');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      req.body = {
        username: 'testuser',
        password: 'password123'
      };
      
      const mockUser = {
        username: 'testuser',
        _id: 'user123',
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(null); // User doesn't exist
      User.mockImplementation(() => mockUser);

      // Act
      await register(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        username: 'testuser'
      });
      expect(logger.info).toHaveBeenCalledWith('New user registered: testuser');
    });

    it('should return 400 if username is missing', async () => {
      // Arrange
      req.body = {
        password: 'password123'
      };

      // Act
      await register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username and password are required'
      });
    });

    it('should return 400 if password is missing', async () => {
      // Arrange
      req.body = {
        username: 'testuser'
      };

      // Act
      await register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username and password are required'
      });
    });

    it('should return 400 if username is too short', async () => {
      // Arrange
      req.body = {
        username: 'ab',
        password: 'password123'
      };

      // Act
      await register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username must be at least 3 characters'
      });
    });

    it('should return 400 if password is too short', async () => {
      // Arrange
      req.body = {
        username: 'testuser',
        password: '12345'
      };

      // Act
      await register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    });

    it('should return 400 if username already exists', async () => {
      // Arrange
      req.body = {
        username: 'existinguser',
        password: 'password123'
      };
      
      User.findOne.mockResolvedValue({ username: 'existinguser' });

      // Act
      await register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username already exists'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.body = {
        username: 'testuser',
        password: 'password123'
      };
      
      const error = new Error('Database error');
      User.findOne.mockRejectedValue(error);

      // Act
      await register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error during registration'
      });
      expect(logger.error).toHaveBeenCalledWith('Registration error:', error);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      req.body = {
        username: 'testuser',
        password: 'password123'
      };

      const mockUser = {
        username: 'testuser',
        _id: 'user123',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);

      // Act
      await login(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        username: 'testuser',
        userId: 'user123'
      });
      expect(logger.info).toHaveBeenCalledWith('User logged in: testuser');
    });

    it('should return 401 if user not found', async () => {
      // Arrange
      req.body = {
        username: 'nonexistent',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null);

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should return 401 if password is incorrect', async () => {
      // Arrange
      req.body = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const mockUser = {
        username: 'testuser',
        _id: 'user123',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.findOne.mockResolvedValue(mockUser);

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.body = {
        username: 'testuser',
        password: 'password123'
      };

      const error = new Error('Database error');
      User.findOne.mockRejectedValue(error);

      // Act
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server error during login'
      });
      expect(logger.error).toHaveBeenCalledWith('Login error:', error);
    });
  });
});
