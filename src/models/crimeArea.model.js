import mongoose, { Schema } from 'mongoose'

const crimeAreaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    area: {
        type: {
            type: String,
            enum: ["Point", "Polygon"],
            required: true
        },
        coordinates: {
            type: Array, // [longitude and latitude]
            required: true
        }
    },
    crimeRate: {
        type: String
    }
}, { timestamps: true });

// crimeAreaSchema.index({area : "2dsphere"});

export const CrimeArea = mongoose.model('CrimeArea', crimeAreaSchema);