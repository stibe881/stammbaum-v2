const express = require('express');
const router = express.Router();
const { Person, Media } = require('../models');

// GET all persons
router.get('/', async (req, res) => {
    try {
        const persons = await Person.findAll({
            include: [{ model: Media }]
        });
        res.json(persons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET one person
router.get('/:id', async (req, res) => {
    try {
        const person = await Person.findByPk(req.params.id, {
            include: [{ model: Media }]
        });
        if (!person) return res.status(404).json({ error: 'Person not found' });
        res.json(person);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE person
router.post('/', async (req, res) => {
    try {
        const person = await Person.create(req.body);
        res.status(201).json(person);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE person
router.put('/:id', async (req, res) => {
    try {
        const person = await Person.findByPk(req.params.id);
        if (!person) return res.status(404).json({ error: 'Person not found' });
        await person.update(req.body);
        res.json(person);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE person
router.delete('/:id', async (req, res) => {
    try {
        const person = await Person.findByPk(req.params.id);
        if (!person) return res.status(404).json({ error: 'Person not found' });
        await person.destroy();
        res.json({ message: 'Person deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
