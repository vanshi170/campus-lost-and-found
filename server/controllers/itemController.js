const fs = require('fs');
const path = require('path');
const { Item } = require('../models/Item');
const { findMatches, scoreItemPair } = require('../utils/matcher');

/**
 * Helper to safely remove an uploaded file from disk
 */
const safeDeleteFile = (relativeUrl) => {
  if (!relativeUrl || !relativeUrl.startsWith('/uploads/')) return;
  try {
    const filename = path.basename(relativeUrl);
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`[File Deletion Error]: Could not delete ${relativeUrl}`, err.message);
  }
};

/**
 * @desc    Get all items with filtering, search, and pagination
 * @route   GET /api/items
 * @access  Public
 */
const getItems = async (req, res, next) => {
  try {
    const {
      type,
      category,
      campusZone,
      status = 'open',
      q,
      from,
      to,
      page = 1,
      limit = 12,
      sort = 'newest'
    } = req.query;

    const filter = {};

    // Filter by type ('lost' or 'found')
    if (type && ['lost', 'found'].includes(type.toLowerCase())) {
      filter.type = type.toLowerCase();
    }

    // Filter by status (default is 'open', can specify 'resolved' or 'all')
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Filter by Category
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Filter by Campus Zone
    if (campusZone && campusZone !== 'All') {
      filter.campusZone = campusZone;
    }

    // Filter by Date Range (dateOccurred)
    if (from || to) {
      filter.dateOccurred = {};
      if (from) filter.dateOccurred.$gte = new Date(from);
      if (to) {
        // Set to end of the selected day
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.dateOccurred.$lte = toDate;
      }
    }

    // Keyword Search across title, description, and locationName
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { locationName: searchRegex },
        { color: searchRegex }
      ];
    }

    // Sorting options
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'date_asc') sortOptions = { dateOccurred: 1 };
    if (sort === 'date_desc') sortOptions = { dateOccurred: -1 };

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Populated poster name only (never email or phone in lists)
    const items = await Item.find(filter)
      .populate('postedBy', 'name _id')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: items.length,
      total,
      totalPages,
      currentPage: pageNum,
      items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item detail
 * @route   GET /api/items/:id
 * @access  Public (Poster contact revealed only if logged in)
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    // Populate poster with or without contact details depending on auth
    const isRequesterLoggedIn = Boolean(req.user);

    let populatedItem;
    if (isRequesterLoggedIn) {
      populatedItem = await Item.findById(req.params.id).populate(
        'postedBy',
        'name email phone createdAt _id'
      );
    } else {
      populatedItem = await Item.findById(req.params.id).populate(
        'postedBy',
        'name _id'
      );
    }

    return res.status(200).json({
      success: true,
      item: populatedItem,
      canViewContact: isRequesterLoggedIn
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new lost or found item post
 * @route   POST /api/items
 * @access  Private
 */
const createItem = async (req, res, next) => {
  try {
    const {
      type,
      title,
      description,
      category,
      color,
      locationName,
      campusZone,
      dateOccurred
    } = req.body;

    if (!type || !title || !description || !category || !locationName || !campusZone || !dateOccurred) {
      // If a file was uploaded but validation fails, remove the uploaded file
      if (req.file) {
        safeDeleteFile(`/uploads/${req.file.filename}`);
      }
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.'
      });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const item = await Item.create({
      type,
      title,
      description,
      category,
      color: color || '',
      locationName,
      campusZone,
      dateOccurred: new Date(dateOccurred),
      imageUrl,
      postedBy: req.user._id
    });

    const populated = await Item.findById(item._id).populate('postedBy', 'name _id');

    return res.status(201).json({
      success: true,
      message: 'Item successfully posted!',
      item: populated
    });
  } catch (error) {
    if (req.file) {
      safeDeleteFile(`/uploads/${req.file.filename}`);
    }
    next(error);
  }
};

/**
 * @desc    Update an item post
 * @route   PUT /api/items/:id
 * @access  Private (Owner only)
 */
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    // Check ownership
    if (item.postedBy.toString() !== req.user._id.toString()) {
      if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not the owner of this post.'
      });
    }

    const {
      type,
      title,
      description,
      category,
      color,
      locationName,
      campusZone,
      dateOccurred,
      status,
      removeImage
    } = req.body;

    if (type) item.type = type;
    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (color !== undefined) item.color = color;
    if (locationName) item.locationName = locationName;
    if (campusZone) item.campusZone = campusZone;
    if (dateOccurred) item.dateOccurred = new Date(dateOccurred);
    if (status && ['open', 'resolved'].includes(status)) item.status = status;

    // Handle new image upload
    if (req.file) {
      // Remove old image if one existed
      if (item.imageUrl) {
        safeDeleteFile(item.imageUrl);
      }
      item.imageUrl = `/uploads/${req.file.filename}`;
    } else if (removeImage === 'true' || removeImage === true) {
      if (item.imageUrl) {
        safeDeleteFile(item.imageUrl);
      }
      item.imageUrl = '';
    }

    const updatedItem = await item.save();
    const populated = await Item.findById(updatedItem._id).populate(
      'postedBy',
      'name email phone _id'
    );

    return res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      item: populated
    });
  } catch (error) {
    if (req.file) safeDeleteFile(`/uploads/${req.file.filename}`);
    next(error);
  }
};

/**
 * @desc    Delete an item post and remove its image from disk
 * @route   DELETE /api/items/:id
 * @access  Private (Owner only)
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    // Check ownership
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own posts.'
      });
    }

    // Delete image from disk if exists
    if (item.imageUrl) {
      safeDeleteFile(item.imageUrl);
    }

    await Item.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Item post deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark an item as resolved
 * @route   PATCH /api/items/:id/resolve
 * @access  Private (Owner only)
 */
const resolveItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    // Check ownership
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only resolve your own posts.'
      });
    }

    item.status = 'resolved';
    await item.save();

    return res.status(200).json({
      success: true,
      message: 'Item marked as resolved!',
      item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get top suggested matches for an item
 * @route   GET /api/items/:id/matches
 * @access  Public
 */
const getItemMatches = async (req, res, next) => {
  try {
    const targetItem = await Item.findById(req.params.id);

    if (!targetItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found.'
      });
    }

    // Match candidate must be opposite type and currently open
    const oppositeType = targetItem.type === 'lost' ? 'found' : 'lost';

    const candidateItems = await Item.find({
      type: oppositeType,
      status: 'open',
      _id: { $ne: targetItem._id }
    }).populate('postedBy', 'name _id');

    // Calculate matches with matcher utility (threshold 30, top 5)
    const matches = findMatches(targetItem, candidateItems, 30, 5);

    return res.status(200).json({
      success: true,
      targetId: targetItem._id,
      count: matches.length,
      matches
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all items posted by the logged in user with strong match counts
 * @route   GET /api/items/mine
 * @access  Private
 */
const getMyPosts = async (req, res, next) => {
  try {
    const myItems = await Item.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch all currently open items to compute strong match counts
    const allOpenItems = await Item.find({ status: 'open' })
      .populate('postedBy', 'name _id')
      .lean();

    const openLostItems = allOpenItems.filter(item => item.type === 'lost');
    const openFoundItems = allOpenItems.filter(item => item.type === 'found');

    // Attach strong match count (score >= 50) for each item
    const itemsWithMatchCounts = myItems.map(item => {
      if (item.status === 'resolved') {
        return { ...item, strongMatchCount: 0 };
      }

      const candidates = item.type === 'lost' ? openFoundItems : openLostItems;
      let strongMatchCount = 0;

      for (const candidate of candidates) {
        if (candidate._id.toString() !== item._id.toString()) {
          const { matchScore } = scoreItemPair(item, candidate);
          if (matchScore >= 50) {
            strongMatchCount++;
          }
        }
      }

      return {
        ...item,
        strongMatchCount
      };
    });

    return res.status(200).json({
      success: true,
      count: itemsWithMatchCounts.length,
      items: itemsWithMatchCounts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  resolveItem,
  getItemMatches,
  getMyPosts
};
