const { Item } = require('../models/Item');

/**
 * @desc    Get aggregate statistics for the home page counter
 * @route   GET /api/stats
 * @access  Public
 */
const getStats = async (req, res, next) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalLost, totalFound, totalResolved, itemsThisWeek, openMatchesCount] = await Promise.all([
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: 'resolved' }),
      Item.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      // Also provide total active items currently open
      Item.countDocuments({ status: 'open' })
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalLost,
        totalFound,
        totalResolved,
        itemsThisWeek,
        activeOpenItems: openMatchesCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats
};
