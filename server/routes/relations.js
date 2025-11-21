const express = require('express');
const router = express.Router();
const { Relation, Person } = require('../models');

// GET all relations
router.get('/', async (req, res) => {
    try {
        const relations = await Relation.findAll();
        res.json(relations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE relation
router.post('/', async (req, res) => {
    try {
        const { person1Id, person2Id, type } = req.body;

        // Basic validation: cannot relate to self
        if (person1Id === person2Id) {
            return res.status(400).json({ error: 'Cannot create relation to self' });
        }

        const relation = await Relation.create(req.body);
        res.status(201).json(relation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE relation
router.delete('/:id', async (req, res) => {
    try {
        const relation = await Relation.findByPk(req.params.id);
        if (!relation) return res.status(404).json({ error: 'Relation not found' });
        await relation.destroy();
        res.json({ message: 'Relation deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
