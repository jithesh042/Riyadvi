import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dept: { type: String, default: '' },
  loc: { type: String, default: '' },
}, { timestamps: true, strict: false });

export default mongoose.models.Application || mongoose.model('Application', applicationSchema);
