import mongoose, {Schema} from 'mongoose'

const adminsSchema = new mongoose.Schema({
  badgeNumber: {
    type: String,
    required: true
  }
}, { timestamps: true });

export const name = mongoose.model('Admin', adminsSchema);