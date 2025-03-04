require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const extractTextFromPDF = require('./utils/pdfExtractor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/pdf-extractor',
        ttl: 24 * 60 * 60 // 1 day
    })
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pdf-extractor')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// PDF Schema
const pdfSchema = new mongoose.Schema({
    userId: String,
    filename: String,
    originalName: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});

const PDF = mongoose.model('PDF', pdfSchema);

// Multer configuration for PDF upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Extract text from PDF using PDF.js (you'll need to implement this)
        const extractedText = await extractTextFromPDF(req.file.path);

        // Save to database
        const pdf = new PDF({
            userId: req.session.userId || 'anonymous',
            filename: req.file.filename,
            originalName: req.file.originalname,
            text: extractedText
        });

        await pdf.save();
        res.json({ 
            success: true, 
            pdfId: pdf._id,
            text: extractedText 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Error processing PDF' });
    }
});

app.get('/api/pdfs', async (req, res) => {
    try {
        const pdfs = await PDF.find({ userId: req.session.userId || 'anonymous' })
            .sort({ createdAt: -1 });
        res.json(pdfs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching PDFs' });
    }
});

app.get('/api/pdfs/:id', async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);
        if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
        }
        res.json(pdf);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching PDF' });
    }
});

app.post('/api/ask', async (req, res) => {
    try {
        const { pdfId, question } = req.body;
        const pdf = await PDF.findById(pdfId);
        
        if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Context: ${pdf.text}\n\nQuestion: ${question}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });
    } catch (error) {
        console.error('Q&A error:', error);
        res.status(500).json({ error: 'Error processing question' });
    }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 