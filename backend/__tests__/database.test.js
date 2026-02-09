const mongoose = require('mongoose');
const connectDB = require('../config/database');
const logger = require('../utils/logger');

// Mock mongoose and logger
jest.mock('mongoose');
jest.mock('../utils/logger');

describe('Database Configuration', () => {
  let consoleErrorSpy, processExitSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on process.exit to prevent test from exiting
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    processExitSpy.mockRestore();
  });

  describe('connectDB', () => {
    it('should connect to MongoDB successfully', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: 'localhost'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(
        process.env.MONGODB_URI,
        expect.any(Object)
      );
      expect(logger.info).toHaveBeenCalledWith('✅ MongoDB connected successfully: localhost');
    });

    it('should use MONGODB_URI from environment variables', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://testhost:27017/testdb';
      const mockConnection = {
        connection: {
          host: 'testhost'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb://testhost:27017/testdb',
        expect.any(Object)
      );
    });

    it('should log connection host on success', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: '127.0.0.1:27017'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        '✅ MongoDB connected successfully: 127.0.0.1:27017'
      );
    });

    it('should handle connection errors and exit process', async () => {
      // Arrange
      const error = new Error('Connection failed');
      mongoose.connect.mockRejectedValue(error);

      // Act
      await connectDB();

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        '❌ MongoDB connection error:',
        'Connection failed'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should log error message on connection failure', async () => {
      // Arrange
      const error = new Error('Network timeout');
      mongoose.connect.mockRejectedValue(error);

      // Act
      await connectDB();

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        '❌ MongoDB connection error:',
        'Network timeout'
      );
    });

    it('should handle errors without message property', async () => {
      // Arrange
      const error = { code: 'ECONNREFUSED' };
      mongoose.connect.mockRejectedValue(error);

      // Act
      await connectDB();

      // Assert
      expect(logger.error).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should pass connection options to mongoose.connect', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: 'localhost'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      const connectCall = mongoose.connect.mock.calls[0];
      expect(connectCall[1]).toBeDefined();
      expect(typeof connectCall[1]).toBe('object');
    });
  });
});
