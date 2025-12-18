const express = require('express');
const router = express.Router();
const routeros = require('../utils/routerosHelpers');

// List all users
router.get('/users', async (req, res) => {
    try {
        const users = await routeros.getHotspotUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new user
router.post('/users', async (req, res) => {
    const { username, password, profile } = req.body;
    try {
        await routeros.addHotspotUser(username, password, profile);
        res.json({ message: 'User added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
