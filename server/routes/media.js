const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Media, Person } = require('../models');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Upload file for a person
router.post('/upload/:personId', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { personId } = req.params;
        const { type = 'photo', description } = req.body;

        const person = await Person.findByPk(personId);
        if (!person) {
            // Clean up file if person not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Person not found' });
        }

        const media = await Media.create({
            personId,
            filePath: req.file.path, // In production, you might want relative path or URL
            type,
            description
        });

        // If it's a photo, update the person's main photoUrl if not set
        if (type === 'photo' && !person.photoUrl) {
            await person.update({ photoUrl: req.file.path });
        }

        res.status(201).json(media);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get media for a person
router.get('/person/:personId', async (req, res) => {
    try {
        const media = await Media.findAll({ where: { personId: req.params.personId } });
        res.json(media);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
