import mongoose, { Schema } from 'mongoose'

const crimeAreaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description : {
        type : String,
    },
    area : [ // array og latitude and longitude
        {
            type : string
        }
    ],
    crimeRate : {
        type : number
    }
}, { timestamps: true });

export const CrimeArea = mongoose.model('CrimeArea', crimeAreaSchema);