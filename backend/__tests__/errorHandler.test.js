const { errorHandler, notFound } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Mock logger
jest.mock('../utils/logger');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      originalUrl: '/api/test'
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
  });

  describe('errorHandler', () => {
    it('should handle ValidationError', () => {
      // Arrange
      const error = {
        name: 'ValidationError',
        errors: {
          username: { message: 'Username is required' },
          password: { message: 'Password is required' }
        }
      };

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation Error',
        errors: ['Username is required', 'Password is required']
      });
      expect(logger.error).toHaveBeenCalledWith('Error:', error);
    });

    it('should handle duplicate key error (code 11000)', () => {
      // Arrange
      const error = {
        code: 11000,
        keyPattern: { username: 1 }
      };

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'username already exists'
      });
      expect(logger.error).toHaveBeenCalledWith('Error:', error);
    });

    it('should handle CastError (invalid ID)', () => {
      // Arrange
      const error = {
        name: 'CastError',
        path: '_id',
        value: 'invalid_id'
      };

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid ID format'
      });
      expect(logger.error).toHaveBeenCalledWith('Error:', error);
    });

    it('should handle generic errors with default 500 status', () => {
      // Arrange
      const error = new Error('Something went wrong');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong'
      });
      expect(logger.error).toHaveBeenCalledWith('Error:', error);
    });

    it('should use custom statusCode if provided', () => {
      // Arrange
      const error = new Error('Forbidden');
      error.statusCode = 403;

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Forbidden'
      });
    });

    it('should use default message if error message is empty', () => {
      // Arrange
      const error = new Error();

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal Server Error'
      });
    });

    it('should log error with logger', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(logger.error).toHaveBeenCalledWith('Error:', error);
    });
  });

  describe('notFound', () => {
    it('should create 404 error and call next', () => {
      // Arrange
      req.originalUrl = '/api/unknown-endpoint';

      // Act
      notFound(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(logger.warn).toHaveBeenCalledWith('404 Not Found - /api/unknown-endpoint');
      expect(next).toHaveBeenCalled();
      
      const errorArg = next.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(Error);
      expect(errorArg.message).toBe('Not Found - /api/unknown-endpoint');
    });

    it('should handle root path not found', () => {
      // Arrange
      req.originalUrl = '/';

      // Act
      notFound(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(logger.warn).toHaveBeenCalledWith('404 Not Found - /');
      expect(next).toHaveBeenCalled();
    });

    it('should log warning for 404', () => {
      // Arrange
      req.originalUrl = '/test-path';

      // Act
      notFound(req, res, next);

      // Assert
      expect(logger.warn).toHaveBeenCalledWith('404 Not Found - /test-path');
    });
  });
});
