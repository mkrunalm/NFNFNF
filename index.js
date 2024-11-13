const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env
dotenv.config();

const app = express();
const port = 5000;  // Change to a different port, like 5000

app.use(bodyParser.json());

// Serve the frontend
app.use(express.static(path.join(__dirname, 'public')));  // Serve the public folder

// MongoDB setup (removed deprecated options)
const client = new MongoClient(process.env.MONGO_URI);
let collection;

async function connectToDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('notepad');
        collection = db.collection('notes');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

connectToDB();

// Route to save note
app.post('/save-note', async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).send('Content is required');
    }

    // Save note to MongoDB
    try {
        await collection.insertOne({ content });
        res.status(200).send('Note saved successfully');
    } catch (err) {
        res.status(500).send('Failed to save note');
    }
});

// Route to get all notes
app.get('/get-notes', async (req, res) => {
    try {
        const notes = await collection.find({}).toArray();
        res.status(200).json(notes);
    } catch (err) {
        res.status(500).send('Failed to retrieve notes');
    }
});

// Save note to local .txt file when Ctrl+S is pressed
app.post('/save-file', (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).send('Content is required');
    }

    const filePath = `./notepad_${Date.now()}.txt`;
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            return res.status(500).send('Failed to save file');
        }
        res.status(200).send(`File saved as ${filePath}`);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
