const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Queue = require('../models/Queue');

// @route   PATCH /api/admin/queues/:id/serve
// @desc    Serve the next user in the queue
router.patch('/queues/:id/serve', async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (queue.queue.length === 0) {
      queue.nowServing = null;
      await queue.save();
      return res.status(200).json({
        message: 'The queue is currently empty. No users to serve.',
        queue
      });
    }

    // Dequeue the first user in the array
    const servedUserEntry = queue.queue.shift();
    queue.nowServing = servedUserEntry.userId;
    await queue.save();

    // Update the served user's history
    const user = await User.findById(servedUserEntry.userId);
    if (user) {
      user.history.push({
        queueId: queue._id,
        queueName: queue.name,
        status: 'served',
        timestamp: new Date()
      });
      await user.save();
    }

    res.status(200).json({
      message: `Now serving user: ${servedUserEntry.name}`,
      servedUser: {
        userId: servedUserEntry.userId,
        name: servedUserEntry.name,
        email: servedUserEntry.email
      },
      queue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
