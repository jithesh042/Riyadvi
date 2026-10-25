import mongoose from 'mongoose';

const healthCheckSchema = new mongoose.Schema({
  date: { type: String, default: '' },
  answers: { type: mongoose.Schema.Types.Mixed, default: {} },
  score: { type: Number, min: 0, max: 100, required: true },
}, { timestamps: true, strict: false });

export default mongoose.models.HealthCheck || mongoose.model('HealthCheck', healthCheckSchema);
