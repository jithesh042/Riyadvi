import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, lowercase: true, default: '' },
  message: { type: String, trim: true, default: '' },
  source: { type: String, default: 'contact-form' },
  timestamp: { type: String, default: '' },
}, { timestamps: true, strict: false });

export default mongoose.models.Contact || mongoose.model('Contact', contactSchema);
