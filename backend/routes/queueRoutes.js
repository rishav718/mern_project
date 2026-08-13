const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Queue = require('../models/Queue');

// @route   POST /api/queues/:id/join
// @desc    Join a specific queue
router.post('/:id/join', async (req, res) => {
  try {
    let { userId, name, email } = req.body;
    let user;

    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } else if (name && email) {
      user = await User.findOne({ email });
      if (!user) {
        user = new User({ name, email, role: 'customer' });
        await user.save();
      }
      userId = user._id;
    } else {
      return res.status(400).json({ message: 'userId or both name and email are required' });
    }

    const queue = await Queue.findById(req.params.id);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    if (!queue.isActive) {
      return res.status(400).json({ message: 'This queue is currently inactive' });
    }

    // Check if user is already in the queue
    const isAlreadyInQueue = queue.queue.some(
      (item) => item.userId.toString() === userId.toString()
    );
    if (isAlreadyInQueue) {
      return res.status(400).json({ message: 'User is already in this queue' });
    }

    // Check if user is currently being served
    if (queue.nowServing && queue.nowServing.toString() === userId.toString()) {
      return res.status(400).json({ message: 'User is already being served' });
    }

    // Add user to the queue
    queue.queue.push({
      userId: user._id,
      name: user.name,
      email: user.email,
      joinedAt: new Date()
    });

    await queue.save();

    // Update user history
    user.history.push({
      queueId: queue._id,
      queueName: queue.name,
      status: 'joined',
      timestamp: new Date()
    });
    await user.save();

    res.status(200).json({
      message: 'Successfully joined the queue',
      queue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/queues/:id/status
// @desc    Get status of queue (and optionally user position & wait time)
router.get('/:id/status', async (req, res) => {
  try {
    const queue = await Queue.findById(req.params.id);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    const { userId, admin } = req.query;
    const totalInQueue = queue.queue.length;

    let responseData = {
      queueName: queue.name,
      isActive: queue.isActive,
      totalInQueue,
      nowServing: queue.nowServing,
      averageServiceTime: queue.averageServiceTime
    };

    if (admin === 'true') {
      responseData.queue = queue.queue;
    }

    if (userId) {
      // Find user position
      const userIndex = queue.queue.findIndex(
        (item) => item.userId.toString() === userId.toString()
      );

      if (userIndex !== -1) {
        const position = userIndex + 1;
        const estimatedWaitTime = position * queue.averageServiceTime;
        responseData = {
          ...responseData,
          inQueue: true,
          position,
          estimatedWaitTime
        };
      } else if (queue.nowServing && queue.nowServing.toString() === userId.toString()) {
        responseData = {
          ...responseData,
          inQueue: false,
          isNowServing: true,
          position: 0,
          estimatedWaitTime: 0
        };
      } else {
        responseData = {
          ...responseData,
          inQueue: false,
          message: 'User is not in this queue'
        };
      }
    }

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/queues/:id/leave
// @desc    Leave a queue voluntarily
router.delete('/:id/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const queue = await Queue.findById(req.params.id);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found' });
    }

    // Check if user exists in the queue array
    const userIndex = queue.queue.findIndex(
      (item) => item.userId.toString() === userId.toString()
    );

    if (userIndex === -1) {
      return res.status(400).json({ message: 'User is not in this queue' });
    }

    // Remove user
    queue.queue.splice(userIndex, 1);
    await queue.save();

    // Update user history
    const user = await User.findById(userId);
    if (user) {
      user.history.push({
        queueId: queue._id,
        queueName: queue.name,
        status: 'left',
        timestamp: new Date()
      });
      await user.save();
    }

    res.status(200).json({
      message: 'Successfully left the queue',
      queue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
