const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const db = require('./models');

const personRoutes = require('./routes/persons');
const relationRoutes = require('./routes/relations');
const mediaRoutes = require('./routes/media');
const gedcomRoutes = require('./routes/gedcom');
const validateRoutes = require('./routes/validate');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files

app.use('/api/persons', personRoutes);
app.use('/api/relations', relationRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/gedcom', gedcomRoutes);
app.use('/api/validate', validateRoutes);

app.get('/', (req, res) => {
    res.send('Stammbaum API is running');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Sync Database
db.sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synced successfully.');
    })
    .catch((err) => {
        console.error('Failed to sync database:', err);
    });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
