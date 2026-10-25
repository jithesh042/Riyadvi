import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import LeadMagnet from './models/LeadMagnet.js';
import HealthCheck from './models/HealthCheck.js';
import Application from './models/Application.js';
import Contact from './models/Contact.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: process.env.CLIENT_URL || 'https://riyadvi-frontend.onrender.com' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'riyadvi-api' }));

app.get('/api/leads', async (_req, res, next) => {
  try { res.json(await LeadMagnet.find().sort({ createdAt: -1 }).lean()); } catch (err) { next(err); }
});
app.post('/api/leads', async (req, res, next) => {
  try {
    const lead = await LeadMagnet.create({
      name: req.body.name, email: req.body.email, message: req.body.message,
      teamSize: req.body.teamSize, goal: req.body.goal,
      timestamp: req.body.timestamp || new Date().toLocaleDateString(),
      source: req.body.source || 'ai-strategy-form',
    });
    res.status(201).json(lead);
  } catch (err) { next(err); }
});

app.get('/api/health-reports', async (_req, res, next) => {
  try { res.json(await HealthCheck.find().sort({ createdAt: -1 }).lean()); } catch (err) { next(err); }
});
app.post('/api/health-reports', async (req, res, next) => {
  try {
    const report = await HealthCheck.create({ date: req.body.date, answers: req.body.answers, score: req.body.score });
    res.status(201).json(report);
  } catch (err) { next(err); }
});

app.get('/api/job-applications', async (_req, res, next) => {
  try { res.json(await Application.find().sort({ createdAt: -1 }).lean()); } catch (err) { next(err); }
});
app.post('/api/job-applications', async (req, res, next) => {
  try {
    const application = await Application.create({ title: req.body.title, dept: req.body.dept, loc: req.body.loc });
    res.status(201).json(application);
  } catch (err) { next(err); }
});

app.get('/api/contacts', async (_req, res, next) => {
  try { res.json(await Contact.find().sort({ createdAt: -1 }).lean()); } catch (err) { next(err); }
});
app.post('/api/contacts', async (req, res, next) => {
  try {
    const contact = await Contact.create({
      name: req.body.name, email: req.body.email, message: req.body.message,
      source: req.body.source || 'contact-form',
      timestamp: req.body.timestamp || new Date().toLocaleDateString(),
    });
    res.status(201).json(contact);
  } catch (err) { next(err); }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.name === 'ValidationError' ? 400 : 500).json({ message: err.message || 'Internal server error' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`Riyadvi API running on http://localhost:${PORT}`)))
  .catch((err) => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
