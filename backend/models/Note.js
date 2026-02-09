const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Note text is required'],
    trim: true,
    minlength: [1, 'Note text cannot be empty'],
    maxlength: [10000, 'Note text cannot exceed 10000 characters']
  },
  tag: {
    type: String,
    default: 'General',
    enum: {
      values: ['General', 'Gym', 'Food', 'Bills', 'Work', 'Shopping', 'Personal', 'Private'],
      message: '{VALUE} is not a valid tag'
    }
  },
  image: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  }
}, {
  timestamps: true
});

// Index for better query performance
noteSchema.index({ userId: 1, createdAt: -1 });

// Virtual for formatted date
noteSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Method to transform note for API response
noteSchema.methods.toJSON = function() {
  const note = this.toObject({ virtuals: true });
  note.id = note._id;
  delete note._id;
  delete note.__v;
  return note;
};

module.exports = mongoose.model('Note', noteSchema);
