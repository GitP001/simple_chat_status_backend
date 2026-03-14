require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// MongoDB connection
// ---------------------------------------------------------------------------
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/simple_chat_status';
const PORT = process.env.PORT || 3001;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const statusSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    label: { type: String, default: '' },
    color: { type: String, default: '#9E9E9E' },
  },
  { timestamps: true }
);

const Status = mongoose.model('Status', statusSchema);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'simple_chat_status_backend' });
});

// PUT /status/:userId — set or update status
app.put('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { value, label, color } = req.body;

    if (!value) {
      return res.status(400).json({ error: 'value is required' });
    }

    const status = await Status.findOneAndUpdate(
      { userId },
      { value, label: label || value, color: color || '#9E9E9E' },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(status);
  } catch (err) {
    console.error('PUT /status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /status/:userId — get one user's status
app.get('/status/:userId', async (req, res) => {
  try {
    const status = await Status.findOne({ userId: req.params.userId });

    if (!status) {
      return res.json({ userId: req.params.userId, value: null, label: '', color: '' });
    }

    res.json(status);
  } catch (err) {
    console.error('GET /status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /status/:userId — clear status
app.delete('/status/:userId', async (req, res) => {
  try {
    await Status.findOneAndDelete({ userId: req.params.userId });
    res.json({ userId: req.params.userId, value: null, label: '', color: '' });
  } catch (err) {
    console.error('DELETE /status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /statuses — all users' statuses
app.get('/statuses', async (req, res) => {
  try {
    const statuses = await Status.find().sort({ updatedAt: -1 });
    res.json(statuses);
  } catch (err) {
    console.error('GET /statuses error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Status backend running on http://localhost:${PORT}`);
});