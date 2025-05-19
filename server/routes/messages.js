const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all messages for a user (both sent and received)
router.get('/user/:userId', auth, async (req, res) => {
    try {
        console.log('Received request for user messages:', req.params.userId);
        
        if (!isValidObjectId(req.params.userId)) {
            console.log('Invalid user ID format:', req.params.userId);
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        console.log('Finding messages for user...');
        const messages = await Message.find({
            $or: [
                { sender: req.params.userId },
                { receiver: req.params.userId }
            ]
        })
        .populate('item', 'title images')
        .populate('sender', 'name profileImage')
        .populate('receiver', 'name profileImage')
        .sort({ createdAt: -1 });
        
        console.log('Found messages:', messages.length);
        res.json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// Get conversation between two users for a specific item
router.get('/conversation/:itemId/:userId1/:userId2', auth, async (req, res) => {
    try {
        const { itemId, userId1, userId2 } = req.params;
        console.log('Received request for conversation:', { itemId, userId1, userId2 });
        
        if (!isValidObjectId(itemId) || !isValidObjectId(userId1) || !isValidObjectId(userId2)) {
            console.log('Invalid ID format:', { itemId, userId1, userId2 });
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        console.log('Finding conversation messages...');
        const messages = await Message.find({
            item: itemId,
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ]
        })
        .populate('sender', 'name profileImage')
        .populate('receiver', 'name profileImage')
        .sort({ createdAt: 1 });
        
        console.log('Found conversation messages:', messages.length);
        res.json(messages);
    } catch (err) {
        console.error('Error fetching conversation:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ message: 'Failed to fetch conversation' });
    }
});

// Send a new message
router.post('/', auth, async (req, res) => {
    try {
        const { itemId, senderId, receiverId, content } = req.body;
        console.log('Received message request:', { itemId, senderId, receiverId, content });
        
        // Validate input
        if (!itemId || !senderId || !receiverId || !content) {
            console.log('Missing required fields:', { itemId, senderId, receiverId, content });
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!isValidObjectId(itemId) || !isValidObjectId(senderId) || !isValidObjectId(receiverId)) {
            console.log('Invalid ID format:', { itemId, senderId, receiverId });
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        if (typeof content !== 'string' || content.trim().length === 0) {
            console.log('Invalid message content:', content);
            return res.status(400).json({ message: 'Invalid message content' });
        }

        // Verify that the sender matches the authenticated user
        if (senderId !== req.user.id) {
            console.log('Sender ID mismatch:', { senderId, authenticatedUserId: req.user.id });
            return res.status(403).json({ message: 'Unauthorized to send message as this user' });
        }
        
        console.log('Creating new message...');
        const message = new Message({
            item: itemId,
            sender: senderId,
            receiver: receiverId,
            content: content.trim()
        });

        const savedMessage = await message.save();
        console.log('Message saved:', savedMessage._id);

        const populatedMessage = await Message.findById(savedMessage._id)
            .populate('item', 'title images')
            .populate('sender', 'name profileImage')
            .populate('receiver', 'name profileImage');
            
        console.log('Message populated successfully');
        res.status(201).json(populatedMessage);
    } catch (err) {
        console.error('Error sending message:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// Mark messages as read
router.patch('/read/:userId', auth, async (req, res) => {
    try {
        console.log('Received request to mark messages as read for user:', req.params.userId);
        
        if (!isValidObjectId(req.params.userId)) {
            console.log('Invalid user ID format:', req.params.userId);
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Verify that the user is marking their own messages as read
        if (req.params.userId !== req.user.id) {
            console.log('User ID mismatch:', { requestedUserId: req.params.userId, authenticatedUserId: req.user.id });
            return res.status(403).json({ message: 'Unauthorized to mark messages as read for this user' });
        }

        console.log('Updating messages...');
        const result = await Message.updateMany(
            { receiver: req.params.userId, read: false },
            { $set: { read: true } }
        );
        console.log('Update result:', result);
        
        res.json({ message: 'Messages marked as read' });
    } catch (err) {
        console.error('Error marking messages as read:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ message: 'Failed to mark messages as read' });
    }
});

module.exports = router; 