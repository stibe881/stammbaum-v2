const express = require('express');
const router = express.Router();
const { validateTree } = require('../utils/validator');

router.get('/', async (req, res) => {
    try {
        const errors = await validateTree();
        res.json(errors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
