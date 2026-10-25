import mongoose from 'mongoose';

const leadMagnetSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, lowercase: true, default: '' },
  message: { type: String, trim: true, default: '' },
  teamSize: { type: String, default: '' },
  goal: { type: String, default: '' },
  source: { type: String, default: 'ai-strategy-form' },
  timestamp: { type: String, default: '' },
}, { timestamps: true, strict: false });

export default mongoose.models.LeadMagnet || mongoose.model('LeadMagnet', leadMagnetSchema);
