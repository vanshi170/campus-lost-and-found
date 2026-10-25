const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  resolveItem,
  getItemMatches,
  getMyPosts
} = require('../controllers/itemController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public search and items list
router.get('/', getItems);

// User's own posts (with match count) - must precede /:id
router.get('/mine', protect, getMyPosts);

// Single item detail - optionalAuth reveals contact details to logged-in students
router.get('/:id', optionalAuth, getItemById);

// Create item with optional image upload
router.post('/', protect, upload.single('image'), createItem);

// Update item (owner only)
router.put('/:id', protect, upload.single('image'), updateItem);

// Delete item (owner only)
router.delete('/:id', protect, deleteItem);

// Mark item as resolved (owner only)
router.patch('/:id/resolve', protect, resolveItem);

// Get suggested opposite-type matches for an item
router.get('/:id/matches', getItemMatches);

module.exports = router;
