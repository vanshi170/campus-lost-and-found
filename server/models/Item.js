const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics',
  'ID & Cards',
  'Bags',
  'Keys',
  'Books & Stationery',
  'Clothing',
  'Accessories',
  'Other'
];

const CAMPUS_ZONES = [
  'Library',
  'Canteen',
  'Hostel',
  'Academic Block',
  'Sports Ground',
  'Parking',
  'Auditorium',
  'Other'
];

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Item type must be either "lost" or "found"']
    },
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a supported category'
      },
      required: [true, 'Category is required']
    },
    color: {
      type: String,
      trim: true,
      default: ''
    },
    locationName: {
      type: String,
      required: [true, 'Please specify the exact location where lost/found'],
      trim: true,
      maxlength: [120, 'Location name cannot exceed 120 characters']
    },
    campusZone: {
      type: String,
      enum: {
        values: CAMPUS_ZONES,
        message: '{VALUE} is not a recognized campus zone'
      },
      required: [true, 'Campus zone is required']
    },
    dateOccurred: {
      type: Date,
      required: [true, 'Please specify the date this occurred']
    },
    imageUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open'
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes to optimize filter queries and text search
itemSchema.index({ type: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ campusZone: 1 });
itemSchema.index({ dateOccurred: -1 });
itemSchema.index({ createdAt: -1 });

// Full-text index for searching item titles and descriptions
itemSchema.index(
  { title: 'text', description: 'text' },
  { weights: { title: 3, description: 1 } }
);

module.exports = {
  Item: mongoose.model('Item', itemSchema),
  CATEGORIES,
  CAMPUS_ZONES
};
