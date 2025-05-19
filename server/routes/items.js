const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('uploads/'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// Get all items (with optional status filter, default: Available)
router.get('/', async (req, res) => {
    try {
        const { status, seller, likedBy, category, minPrice, maxPrice, condition } = req.query;
        let filter = {};
        
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        if (seller) {
            filter.seller = seller;
        }
        
        if (likedBy) {
            filter.likedBy = likedBy;
        }

        if (category) {
            filter.category = category;
        }

        if (condition) {
            filter.condition = condition;
        }

        // 添加价格范围过滤
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) {
                filter.price.$gte = Number(minPrice);
            }
            if (maxPrice) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        const items = await Item.find(filter).populate('seller', 'name deakinId');
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get items by category
router.get('/category/:category', async (req, res) => {
    try {
        const items = await Item.find({ category: req.params.category })
            .populate('seller', 'name deakinId');
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get item by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('seller', 'name deakinId');
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create new item (with image upload)
router.post('/', upload.single('images'), async (req, res) => {
    console.log('req.file:', req.file);
    const item = new Item({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        condition: req.body.condition,
        images: req.file ? [req.file.filename] : [], // 保存为图片文件名
        seller: req.body.seller,
        location: req.body.location
    });

    try {
        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add rating to item
router.post('/:id/rate', async (req, res) => {
    try {
        const { rating, comment, raterId } = req.body;
        if (!rating || !comment || !raterId) {
            return res.status(400).json({ message: 'Rating, comment and rater ID are required' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user has already rated this item
        const existingRating = item.ratings.find(r => r.rater.toString() === raterId);
        if (existingRating) {
            return res.status(400).json({ message: 'You have already rated this item' });
        }

        item.ratings.push({
            rater: raterId,
            rating,
            comment
        });

        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update item status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, buyerId } = req.body;
        if (!['Available', 'Pending', 'Sold'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        item.status = status;
        if (status === 'Sold' && buyerId) {
            item.buyer = buyerId;
        }
        item.updatedAt = Date.now();

        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get item ratings
router.get('/:id/ratings', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('ratings.rater', 'name profileImage')
            .select('ratings');
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(item.ratings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 点赞商品
router.patch('/:id/like', async (req, res) => {
    try {
        const userId = String(req.body.userId); // 从请求体中获取用户 ID 并转为字符串
        if (!userId) return res.status(400).json({ message: 'User ID is required' });
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        if (item.likedBy.includes(userId)) return res.status(400).json({ message: 'Already liked' });
        item.likedBy.push(userId);
        item.likes = (item.likes || 0) + 1;
        await item.save();
        res.json({ likes: item.likes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 取消点赞商品
router.patch('/:id/unlike', async (req, res) => {
    try {
        const userId = String(req.body.userId); // 从请求体中获取用户 ID 并转为字符串
        if (!userId) return res.status(400).json({ message: 'User ID is required' });
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        if (!item.likedBy.includes(userId)) return res.status(400).json({ message: 'Not liked yet' });
        item.likedBy = item.likedBy.filter(id => id !== userId);
        item.likes = Math.max(0, (item.likes || 0) - 1);
        await item.save();
        res.json({ likes: item.likes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 