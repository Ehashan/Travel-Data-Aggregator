require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Schema Definition
const travelRecordSchema = new mongoose.Schema({
    country: String,
    capital: String,
    population: Number,
    temperature: Number,
    weatherDescription: String,
    capitalDetails: mongoose.Schema.Types.Mixed,
    storedAt: { type: Date, default: Date.now }
});

const TravelRecord = mongoose.model('TravelRecord', travelRecordSchema);

// Security Middleware
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_SECRET) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }
    next();
};

const validateAuthToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Token Format' });
    }
    // In a real app, we would validate the token here. For now, just checking format as requested.
    next();
};

// Routes

// Endpoint to provide public config to frontend (safe way to expose non-secret public keys if needed, 
// strictly following prompt "Frontend receives... fetch weather". 
// NOTE: OpenWeather API Key IS technically a secret, but Client-side fetching requires it to be exposed.
// We serve it here so we can keep it in .env on the server.)
app.get('/api/config', (req, res) => {
    res.json({
        openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
        geoDbApiKey: process.env.GEODB_API_KEY
    });
});

// GET /api/records - Return all stored records sorted by date
app.get('/api/records', async (req, res) => {
    try {
        const records = await TravelRecord.find().sort({ storedAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// POST /api/save-data - Save aggregated data
// Apply security middleware
app.post('/api/save-data', validateApiKey, validateAuthToken, async (req, res) => {
    try {
        const { country, capital, population, temperature, weatherDescription, capitalDetails } = req.body;

        if (!country || !capital || population === undefined || temperature === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newRecord = new TravelRecord({
            country,
            capital,
            population,
            temperature,
            weatherDescription,
            capitalDetails
        });

        await newRecord.save();
        res.status(201).json({ message: 'Data saved successfully', record: newRecord });
    } catch (err) {
        console.error('Save Error:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
