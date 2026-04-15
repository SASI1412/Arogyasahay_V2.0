import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import twilio from 'twilio';
import { User } from './models/User.js';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Mongoose connection
if (!process.env.MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI is not set in .env! Database connection will fail.");
} else {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// AI Initialization
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyAWJKZO_XwEAsBP-gRsf8ldaE5SQap0w-s"; // fallback strictly for debugging
const ai = new GoogleGenAI({ apiKey });

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, phoneNumber, email } = req.body;
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }
    user = new User({ username, password, phoneNumber, email });
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Sync Routes
app.get('/api/user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/:username', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Proxies
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, history = [], systemInstruction } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ai/analyze-image', async (req, res) => {
  try {
    const { prompt, base64Data, mimeType, systemInstruction } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: systemInstruction || "You are a clinical report analyst.",
        temperature: 0.3,
      }
    });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Vision Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Twilio Alert Protocol
app.post('/api/alert/sms', async (req, res) => {
  try {
    const { contactPhone, message } = req.body;
    
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(400).json({ error: "Twilio credentials not configured" });
    }
    if (!contactPhone) {
      return res.status(400).json({ error: "No contact phone provided" });
    }
    
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `🚨 AROGYASAHAY ALERT:\n${message}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: contactPhone
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Twilio Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export default app;
